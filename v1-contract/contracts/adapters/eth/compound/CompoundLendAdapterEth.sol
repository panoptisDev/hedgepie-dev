// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

interface IStrategy {
    function mint(uint256) external;

    function redeem(uint256) external;

    function exchangeRateStored() external view returns (uint256);
}

interface IComptroller {
    function enterMarkets(address[] memory) external;

    function exitMarket(address) external;
}

contract CompoundLendAdapterEth is BaseAdapterEth {
    // Address of compound comptroller contract
    address public comptroller;

    // Saving isEntered to comptroller
    bool public isEntered;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _comptroller  address of comptroller
     * @param _stakingToken  address of staking token
     * @param _swapRouter swapRouter for swapping tokens
     * @param _name  adatper name
     * @param _weth  weth address
     */
    constructor(
        address _strategy,
        address _comptroller,
        address _stakingToken,
        address _swapRouter,
        address _weth,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        strategy = _strategy;
        comptroller = _comptroller;
        swapRouter = _swapRouter;
        name = _name;
        weth = _weth;
    }

    /**
     * @notice Deposit with ETH
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn ETH amount
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = HedgepieLibraryEth.swapOnRouter(
            _amountIn,
            address(this),
            stakingToken,
            swapRouter,
            weth
        );

        address[] memory cTokens = new address[](1);
        cTokens[0] = strategy;

        if (!isEntered) {
            isEntered = true;
            IComptroller(comptroller).enterMarkets(cTokens);
        }

        uint256 cAmount = IBEP20(strategy).balanceOf(address(this));
        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).mint(amountOut);
        require(
            IBEP20(strategy).balanceOf(address(this)) > cAmount,
            "Error: Mint failed"
        );

        adapterInfo.totalStaked += amountOut;

        userInfo.amount += amountOut;
        userInfo.invested += _amountIn;
        userInfo.userShares +=
            IBEP20(strategy).balanceOf(address(this)) -
            cAmount;

        // Update adapterInfo contract
        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateParticipantInfo(
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

        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        IBEP20(strategy).approve(strategy, userInfo.userShares);
        IStrategy(strategy).redeem(userInfo.userShares);

        amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;

        amountOut = HedgepieLibraryEth.swapforEth(
            amountOut,
            address(this),
            stakingToken,
            swapRouter,
            weth
        );

        if (amountOut != 0) {
            bool success;
            uint256 taxAmount;
            if (amountOut > userInfo.invested) {
                taxAmount =
                    ((amountOut - userInfo.invested) *
                        IYBNFT(IHedgepieInvestorEth(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorEth(investor).treasury())
                    .call{value: taxAmount}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();

        // Update adapterInfo contract
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        adapterInfo.totalStaked -= userInfo.amount;
        delete userAdapterInfos[_account][_tokenId];
    }

    /**
     * @notice Return the pending reward by ETH
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     */
    function pendingReward(uint256 _tokenId, address _account)
        external
        view
        override
        returns (uint256 reward)
    {
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];

        uint256 exchangeRateCurrent = IStrategy(strategy).exchangeRateStored();
        uint256 mantissa = 18;

        uint256 underlyingAmt = (exchangeRateCurrent * userInfo.userShares) /
            (10**mantissa);

        if (underlyingAmt < userInfo.amount) return 0;

        reward = IPancakeRouter(swapRouter).getAmountsOut(
            underlyingAmt - userInfo.amount,
            getPaths(stakingToken, weth)
        )[1];
    }

    receive() external payable {}
}
