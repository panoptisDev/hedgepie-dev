// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

import "../../../libraries/HedgepieLibraryMatic.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

interface IStrategy {
    function pendingStargate(uint256 poolId, address account)
        external
        view
        returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function deposit(uint256 poolId, uint256 amount) external;

    function withdraw(uint256 poolId, uint256 amount) external;
}

interface IProvider {
    function instantRedeemLocal(
        uint16 poolId,
        uint256 amount,
        address account
    ) external;

    function addLiquidity(
        uint256 poolId,
        uint256 amount,
        address account
    ) external;
}

contract StargateFarmAdapterMatic is BaseAdapterMatic {
    // address of lp staking token
    address public lpStakingToken;

    // address of lp provider
    address public lpProvider;

    // poolId of lp
    uint256 public lpPoolId;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingTokens  address of staking tokens
     * @param _rewardToken  address of reward token
     * @param _swapRouter  address of swap router
     * @param _lpProvider  address of lp provider
     * @param _poolIds  pool ids
     * @param _wmatic  address of wmatic
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address[2] memory _stakingTokens,
        address _rewardToken,
        address _swapRouter,
        address _lpProvider,
        uint256[2] memory _poolIds,
        address _wmatic,
        string memory _name
    ) {
        stakingToken = _stakingTokens[0];
        lpStakingToken = _stakingTokens[1];
        rewardToken = _rewardToken;
        swapRouter = _swapRouter;
        lpProvider = _lpProvider;
        strategy = _strategy;
        pid = _poolIds[0];
        lpPoolId = _poolIds[1];
        wmatic = _wmatic;
        name = _name;
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

        uint256 stakeAmt = HedgepieLibraryMatic.swapOnRouter(
            _amountIn,
            address(this),
            lpStakingToken,
            swapRouter,
            wmatic
        );

        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        IBEP20(lpStakingToken).approve(lpProvider, stakeAmt);
        IProvider(lpProvider).addLiquidity(lpPoolId, stakeAmt, address(this));
        amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;

        uint256 rewardAmt = IBEP20(rewardToken).balanceOf(address(this));
        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(pid, amountOut);
        rewardAmt = IBEP20(rewardToken).balanceOf(address(this)) - rewardAmt;

        if (rewardAmt != 0 && rewardToken != address(0)) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt * 1e12) /
                adapterInfo.totalStaked;
        }

        if (userInfo.amount == 0)
            userInfo.userShares = adapterInfo.accTokenPerShare;

        adapterInfo.totalStaked += amountOut;
        userInfo.amount += amountOut;
        userInfo.invested += _amountIn;

        // Update adapterInfo contract
        address adapterInfoEthAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateParticipantInfo(
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

        uint256 rewardAmt;
        uint256 stakeAmt;
        stakeAmt = IBEP20(stakingToken).balanceOf(address(this));
        rewardAmt = IBEP20(rewardToken).balanceOf(address(this));

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).withdraw(pid, userInfo.amount);

        rewardAmt = IBEP20(rewardToken).balanceOf(address(this)) - rewardAmt;
        stakeAmt = IBEP20(stakingToken).balanceOf(address(this)) - stakeAmt;

        amountOut = IBEP20(lpStakingToken).balanceOf(address(this));
        IBEP20(stakingToken).approve(lpProvider, stakeAmt);
        IProvider(lpProvider).instantRedeemLocal(
            uint16(lpPoolId),
            stakeAmt,
            address(this)
        );
        amountOut = IBEP20(lpStakingToken).balanceOf(address(this)) - amountOut;

        if (rewardAmt != 0 && rewardToken != address(0)) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt * 1e12) /
                adapterInfo.totalStaked;
        }

        amountOut = HedgepieLibraryMatic.swapforMatic(
            amountOut,
            address(this),
            lpStakingToken,
            swapRouter,
            wmatic
        );

        (uint256 reward, ) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        uint256 rewardETH;
        if (reward != 0) {
            rewardETH = HedgepieLibraryMatic.swapforMatic(
                reward,
                address(this),
                rewardToken,
                swapRouter,
                wmatic
            );
        }

        address adapterInfoEthAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();

        amountOut += rewardETH;
        if (rewardETH != 0) {
            IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                rewardETH,
                true
            );
        }

        // Update adapterInfo contract
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        adapterInfo.totalStaked -= userInfo.amount;
        delete userAdapterInfos[_account][_tokenId];

        if (amountOut != 0) {
            bool success;
            uint256 taxAmount;
            if (rewardETH != 0) {
                taxAmount =
                    (rewardETH *
                        IYBNFT(IHedgepieInvestorMatic(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(
                    IHedgepieInvestorMatic(investor).treasury()
                ).call{value: taxAmount}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

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
        onlyInvestor
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        (uint256 reward, ) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;
        userInfo.userShares1 = adapterInfos[_tokenId].accTokenPerShare1;

        if (reward != 0 && rewardToken != address(0)) {
            amountOut += HedgepieLibraryMatic.swapforMatic(
                reward,
                address(this),
                rewardToken,
                swapRouter,
                wmatic
            );
        }

        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(IHedgepieInvestorMatic(investor).ybnft()).performanceFee(
                    _tokenId
                )) / 1e4;
            (bool success, ) = payable(
                IHedgepieInvestorMatic(investor).treasury()
            ).call{value: taxAmount}("");
            require(success, "Failed to send ether to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        IHedgepieAdapterInfoMatic(
            IHedgepieInvestorMatic(investor).adapterInfo()
        ).updateProfitInfo(_tokenId, amountOut, true);

        return amountOut;
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
        AdapterInfo memory adapterInfo = adapterInfos[_tokenId];

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
            ((IStrategy(strategy).pendingStargate(pid, address(this)) * 1e12) /
                adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;

        if (tokenRewards != 0)
            reward = rewardToken == wmatic
                ? tokenRewards
                : IPancakeRouter(swapRouter).getAmountsOut(
                    tokenRewards,
                    getPaths(rewardToken, wmatic)
                )[1];
    }

    receive() external payable {}
}
