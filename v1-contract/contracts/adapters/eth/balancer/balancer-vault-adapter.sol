// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

import "hardhat/console.sol";

struct JoinPoolRequest {
    address[] assets;
    uint256[] maxAmountsIn;
    bytes userData;
    bool fromInternalBalance;
}

interface IStrategy {
    function joinPool(
        bytes32 _pid,
        address _sender,
        address _recipient,
        JoinPoolRequest memory _request
    ) external payable;

    function exitPool(
        bytes32 _pid,
        address _sender,
        address _recipient,
        JoinPoolRequest memory _request
    ) external payable;
}

contract BalancerVaultAdapterEth is BaseAdapterEth {
    bytes32 public poolId;
    address[2] public rewardTokens;

    /**
     * @notice Construct
     * @param _pid  strategy pool id
     * @param _strategy  address of strategy
     * @param _rewardToken  address of reward token
     * @param _repayToken  address of repay token
     * @param _router lp provider router address
     * @param _swapRouter swapRouter for swapping tokens
     * @param _name  adatper name
     * @param _weth  weth address
     */
    constructor(
        bytes32 _pid,
        address _strategy,
        address[2] memory _rewardToken,
        address _repayToken,
        address _router,
        address _swapRouter,
        string memory _name,
        address _weth
    ) {
        poolId = _pid;
        repayToken = _repayToken;
        rewardTokens[0] = _rewardToken[0];
        rewardTokens[1] = _rewardToken[1];
        strategy = _strategy;
        router = _router;
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
        address _account,
        uint256 _amountIn
    ) external payable override returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        uint256 repayAmt = IBEP20(repayToken).balanceOf(address(this));

        address[] memory assets = new address[](2);
        assets[0] = rewardTokens[0];
        assets[1] = address(0);

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 0;
        amounts[1] = msg.value;

        IStrategy(strategy).joinPool{value: msg.value}(
            poolId,
            address(this),
            address(this),
            JoinPoolRequest(assets, amounts, abi.encode(1, amounts), false)
        );
        repayAmt = IBEP20(repayToken).balanceOf(address(this)) - repayAmt;

        amountOut = msg.value;
        adapterInfo.totalStaked += repayAmt;
        userInfo.amount += repayAmt;
        userInfo.invested += _amountIn;

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
        returns (uint256 amountOut)
    {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        uint256 rewardAmt0;
        uint256 rewardAmt1;
        rewardAmt0 = IBEP20(rewardTokens[0]).balanceOf(address(this));
        rewardAmt1 = IBEP20(rewardTokens[1]).balanceOf(address(this));
        IBEP20(repayToken).approve(strategy, userInfo.amount);

        address[] memory assets = new address[](2);
        assets[0] = rewardTokens[0];
        assets[1] = rewardTokens[1];

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1;
        amounts[1] = userInfo.amount;

        uint256[] memory minAmountsOut = new uint256[](2);
        minAmountsOut[0] = 0;
        minAmountsOut[1] = 0;

        IStrategy(strategy).exitPool(
            poolId,
            address(this),
            address(this),
            JoinPoolRequest(
                assets,
                minAmountsOut,
                abi.encode(1, userInfo.amount),
                false
            )
        );
        rewardAmt0 =
            IBEP20(rewardTokens[0]).balanceOf(address(this)) -
            rewardAmt0;
        rewardAmt1 =
            IBEP20(rewardTokens[1]).balanceOf(address(this)) -
            rewardAmt1;

        if (router == address(0)) {
            amountOut = HedgepieLibraryEth.swapforEth(
                address(this),
                amountOut,
                stakingToken,
                swapRouter,
                weth
            );
        } else {
            amountOut = HedgepieLibraryEth.withdrawLP(
                IYBNFT.Adapter(0, stakingToken, address(this)),
                weth,
                amountOut,
                0
            );
        }
        (uint256 reward, uint256 reward1) = HedgepieLibraryEth.getRewards(
            address(this),
            _tokenId,
            _account
        );
        uint256 rewardETH;
        if (reward != 0) {
            rewardETH = HedgepieLibraryEth.swapforEth(
                address(this),
                reward,
                rewardToken,
                swapRouter,
                weth
            );
        }
        if (reward1 != 0) {
            rewardETH += HedgepieLibraryEth.swapforEth(
                address(this),
                reward1,
                rewardToken1,
                swapRouter,
                weth
            );
        }
        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        amountOut += rewardETH;
        if (rewardETH != 0) {
            IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                rewardETH,
                true
            );
        }
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
        userInfo.amount = 0;
        userInfo.invested = 0;
        userInfo.userShares = 0;
        userInfo.userShares1 = 0;
        // if (amountOut != 0) {
        //     bool success;
        //     uint256 taxAmount;
        //     if (rewardETH != 0) {
        //         taxAmount =
        //             (rewardETH *
        //                 IYBNFT(IHedgepieInvestorEth(investor).ybnft())
        //                     .performanceFee(_tokenId)) /
        //             1e4;
        //         (success, ) = payable(IHedgepieInvestorEth(investor).treasury())
        //             .call{value: taxAmount}("");
        //         require(success, "Failed to send ether to Treasury");
        //     }
        //     (success, ) = payable(_account).call{value: amountOut - taxAmount}(
        //         ""
        //     );
        //     require(success, "Failed to send ether");
        // }
        return amountOut;
    }

    /**
     * @notice Claim the pending reward
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     */
    function claim(uint256 _tokenId, address _account)
        external
        payable
        override
        returns (uint256)
    {
        return 0;
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
        return 0;
    }

    receive() external payable {}
}
