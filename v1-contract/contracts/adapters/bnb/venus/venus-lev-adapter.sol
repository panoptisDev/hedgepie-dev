// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterBsc.sol";

import "./interface/VBep20Interface.sol";
import "./interface/ComptrollerInterface.sol";

import "../../../libraries/HedgepieLibraryBsc.sol";

import "../../../interfaces/IHedgepieInvestorBsc.sol";
import "../../../interfaces/IHedgepieAdapterInfoBsc.sol";

interface IStrategy {
    function mint(uint256 amount) external;

    function redeem(uint256 amount) external;

    function redeemUnderlying(uint256 amount) external;

    function borrow(uint256 amount) external;

    function repayBorrow(uint256 amount) external;
}

contract VenusLevAdapterBsc is BaseAdapterBsc {
    // user => nft id => withdrawal amounts stack
    mapping(address => mapping(uint256 => uint256[10]))
        public stackWithdrawalAmounts;

    // borrow rate number
    uint256 public borrowRate;

    // depth of leverage
    uint256 public depth;

    // boolean value of isEntered
    bool public isEntered;

    // address of comptroller
    address public comptroller;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _swapRouter  address of swap router
     * @param _wbnb  address of wbnb
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _swapRouter,
        address _wbnb,
        uint256 _depth,
        string memory _name
    ) {
        require(
            VBep20Interface(_strategy).isVToken(),
            "Error: Invalid vToken address"
        );
        require(
            VBep20Interface(_strategy).underlying() != address(0),
            "Error: Invalid underlying address"
        );

        stakingToken = VBep20Interface(_strategy).underlying();
        repayToken = _strategy;
        strategy = _strategy;
        swapRouter = _swapRouter;
        wbnb = _wbnb;
        name = _name;

        comptroller = VBep20Interface(strategy).comptroller();

        borrowRate = 7900;
        depth = _depth;
    }

    /**
     * @notice Deposit with BNB
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn BNB amount
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = HedgepieLibraryBsc.swapOnRouter(
            _amountIn,
            address(this),
            stakingToken,
            swapRouter,
            wbnb
        );

        uint256 repayAmt = IBEP20(repayToken).balanceOf(address(this));
        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).mint(amountOut);
        repayAmt = IBEP20(repayToken).balanceOf(address(this)) - repayAmt;
        require(repayAmt != 0, "Error: mint failed");

        // Leverage assets
        _leverageAsset(_tokenId, amountOut, _account);

        userInfo.invested += _amountIn;

        // Update adapterInfo contract
        address adapterInfoEthAddr = IHedgepieInvestorBsc(investor)
            .adapterInfo();
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            true
        );

        return _amountIn;
    }

    /**
     * @notice Withdraw the deposited ETH
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     */
    function withdraw(uint256 _tokenId, address _account)
        external
        payable
        override
        onlyInvestor
        returns (uint256 amountOut)
    {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        uint256 repayAmt;

        amountOut = IBEP20(stakingToken).balanceOf(address(this));
        repayAmt = IBEP20(repayToken).balanceOf(address(this));

        _repayAsset(_tokenId, _account);

        repayAmt = repayAmt - IBEP20(repayToken).balanceOf(address(this));
        amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;

        require(amountOut != 0, "Error: Redeem failed");

        amountOut = HedgepieLibraryBsc.swapforBnb(
            amountOut,
            address(this),
            stakingToken,
            swapRouter,
            wbnb
        );

        (uint256 reward, ) = HedgepieLibraryBsc.getRewards(
            _tokenId,
            address(this),
            _account
        );

        uint256 rewardETH;
        if (reward != 0) {
            rewardETH = HedgepieLibraryBsc.swapforBnb(
                reward,
                address(this),
                rewardToken,
                swapRouter,
                wbnb
            );
        }

        address adapterInfoEthAddr = IHedgepieInvestorBsc(investor)
            .adapterInfo();
        amountOut += rewardETH;
        if (rewardETH != 0) {
            IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                rewardETH,
                true
            );
        }

        // Update adapterInfo contract
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        adapterInfo.totalStaked -= userInfo.amount;
        for (uint256 i; i <= depth; i++)
            delete stackWithdrawalAmounts[_account][_tokenId][i];

        delete userAdapterInfos[_account][_tokenId];
        
        if (amountOut != 0) {
            bool success;
            uint256 taxAmount;
            if (rewardETH != 0) {
                taxAmount =
                    (rewardETH *
                        IYBNFT(IHedgepieInvestorBsc(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorBsc(investor).treasury())
                    .call{value: taxAmount}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        return amountOut;
    }

    function _leverageAsset(
        uint256 _tokenId,
        uint256 _amount,
        address _account
    ) internal {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        uint256[2] memory amounts;

        if (!isEntered) {
            address[] memory _vTokens = new address[](1);
            _vTokens[0] = strategy;

            // Enter market
            ComptrollerInterface(comptroller).enterMarkets(_vTokens);
            isEntered = true;

            IBEP20(repayToken).approve(strategy, 2**256 - 1);
        }

        stackWithdrawalAmounts[_account][_tokenId][0] += _amount;

        for (uint256 i; i < depth; i++) {
            amounts[0] = IBEP20(stakingToken).balanceOf(address(this));

            IStrategy(strategy).borrow((_amount * borrowRate) / 1e4);

            amounts[1] = IBEP20(stakingToken).balanceOf(address(this));
            require(amounts[0] < amounts[1], "Error: Borrow failed");

            _amount = amounts[1] - amounts[0];

            IBEP20(stakingToken).approve(strategy, _amount);
            IStrategy(strategy).mint(_amount);

            stackWithdrawalAmounts[_account][_tokenId][i + 1] += _amount;
            userInfo.amount += _amount;
            adapterInfo.totalStaked += _amount;
        }
    }

    function _repayAsset(uint256 _tokenId, address _account) internal {
        require(isEntered, "Error: Not entered market");

        uint256 _amount;
        uint256 bAmt;
        uint256 aAmt;

        for (uint256 i = depth; i > 0; i--) {
            _amount = stackWithdrawalAmounts[_account][_tokenId][i];

            bAmt = IBEP20(stakingToken).balanceOf(address(this));

            IStrategy(strategy).redeemUnderlying(_amount);
            aAmt = IBEP20(stakingToken).balanceOf(address(this));
            require(aAmt - bAmt == _amount, "Error: Devest failed");

            IBEP20(stakingToken).approve(strategy, _amount);
            IStrategy(strategy).repayBorrow(_amount);
        }

        _amount = stackWithdrawalAmounts[_account][_tokenId][0];

        bAmt = IBEP20(stakingToken).balanceOf(address(this));
        IStrategy(strategy).redeemUnderlying((_amount * 9999) / 10000);
        aAmt = IBEP20(stakingToken).balanceOf(address(this));

        require(bAmt < aAmt, "Error: Devest failed");
    }

    receive() external payable {}
}
