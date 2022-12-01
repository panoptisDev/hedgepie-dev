// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterBsc.sol";

import "./interface/VBep20Interface.sol";

import "../../../libraries/HedgepieLibraryBsc.sol";

import "../../../interfaces/IHedgepieInvestorBsc.sol";
import "../../../interfaces/IHedgepieAdapterInfoBsc.sol";

interface IStrategy {
    function mint(uint256 amount) external;

    function redeem(uint256 amount) external;
}

contract VenusLendAdapterBsc is BaseAdapterBsc {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _repayToken  address of repay token
     * @param _swapRouter  address of swap router
     * @param _wbnb  address of wbnb
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _repayToken,
        address _swapRouter,
        address _wbnb,
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

        strategy = _strategy;
        stakingToken = _stakingToken;
        repayToken = _repayToken;
        swapRouter = _swapRouter;
        wbnb = _wbnb;
        name = _name;
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
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
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

        adapterInfo.totalStaked += amountOut;
        userInfo.amount += repayAmt;
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

        IBEP20(repayToken).approve(strategy, userInfo.amount);
        IStrategy(strategy).redeem(userInfo.amount);

        repayAmt = repayAmt - IBEP20(repayToken).balanceOf(address(this));
        amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;

        require(repayAmt == userInfo.amount, "Error: Redeem failed");

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
        userInfo.amount = 0;
        userInfo.invested = 0;
        userInfo.userShares = 0;
        userInfo.userShares1 = 0;

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

    receive() external payable {}
}
