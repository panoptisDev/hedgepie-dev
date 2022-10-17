// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";

import "../../../interfaces/IHedgepieInvestorEth.sol";

interface IStrategy {
    function deposit(uint256 _pid, uing256 _amount) external;

    function withdraw(uint256 _pid, uing256 _amount) external;

    function pendingSushi(uint256 _pid, address _user)
        external
        view
        returns (uint256);
}

contract SushiFarmAdapterEth is BaseAdapterEth {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _rewardToken1  address of reward token
     * @param _router lp provider router address
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _router,
        address _swapRouter,
        string memory _name,
        address _weth
    ) {
        pid = _pid;
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        router = _router;
        swapRouter = _swapRouter;
        name = _name;
        weth = _weth;

        isReward = true;
    }

    function deposit(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) external payable override {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        uint256 amountOut;
        if (router == address(0)) {
            amountOut = HedgepieInvestorEth.swapOnRouter(
                address(this),
                _amountIn,
                stakingToken,
                swapRouter,
                weth
            );
        } else {
            amountOut = HedgepieInvestorEth.getLP(
                address(this),
                weth,
                address(this),
                amountIn,
                0
            );
        }
        uint256 rewardAmt0;
        uint256 rewardAmt1;

        rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this));
        rewardAmt1 = IBEP20(rewardToken1).balanceOf(address(this));

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(pid, amountOut);

        rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this)) - rewardAmt0;
        rewardAmt1 = IBEP20(rewardToken1).balanceOf(address(this)) - rewardAmt1;

        adapterInfo.totalStaked += amountOut;
        if (rewardAmt0 != 0 && rewardToken != address(0)) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt0 * 1e12) /
                adapterInfo.totalStaked;
        }
        if (rewardAmt1 != 0 && rewardToken1 != address(0)) {
            adapterInfo.accTokenPerShare1 +=
                (rewardAmt1 * 1e12) /
                adapterInfo.totalStaked;
        }

        if (userInfo.amount == 0) {
            userInfo.userShares = adapterInfo.accTokenPerShare;
            userInfo.userShares1 = adapterInfo.accTokenPerShare1;
        }

        //TODO: Update adapterInfo contract
    }

    function withdraw(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) external override {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        uint256 rewardAmt0;
        uint256 rewardAmt1;
        uint256 amountOut = IBEP20(stakingToken).balanceOf(address(this));

        rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this));
        rewardAmt1 = IBEP20(rewardToken1).balanceOf(address(this));

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).withdraw(pid, userInfo.amount);

        rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this)) - rewardAmt0;
        rewardAmt1 = IBEP20(rewardToken1).balanceOf(address(this)) - rewardAmt1;
        amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;

        if (rewardAmt0 != 0 && rewardToken != address(0)) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt0 * 1e12) /
                adapterInfo.totalStaked;
        }
        if (rewardAmt1 != 0 && rewardToken1 != address(0)) {
            adapterInfo.accTokenPerShare1 +=
                (rewardAmt1 * 1e12) /
                adapterInfo.totalStaked;
        }

        if (router == address(0)) {
            amountOut = HedgepieInvestorEth.swapforEth(
                address(this),
                amountOut,
                stakingToken,
                swapRouter,
                weth
            );
        } else {
            amountOut = HedgepieLibraryEth.withdrawLP(
                address(this),
                weth,
                address(this),
                amountOut,
                0
            );
        }

        (uint256 reward, uint256 reward1) = HedgepieInvestorEth.getRewards(
            address(this),
            _tokenId,
            _account
        );

        if (reward != 0) {
            amountOut += HedgepieInvestorEth.swapforEth(
                address(this),
                reward,
                rewardToken,
                swapRouter,
                weth
            );
        }

        if (reward1 != 0) {
            amountOut += HedgepieInvestorEth.swapforEth(
                address(this),
                reward1,
                rewardToken1,
                swapRouter,
                weth
            );
        }

        userInfo.amount = 0;
        userInfo.userShares = 0;
        userInfo.userShares1 = 0;
        adapterInfo.totalStaked -= userInfo.amount;

        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(IHedgepieInvestorEth(investor).ybnft()).performanceFee(
                    _tokenId
                )) / 1e4;
            (bool success, ) = payable(treasuryAddr).call{value: taxAmount}("");
            require(success, "Failed to send ether to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        //TODO: Update adapterInfo contract
    }

    function claim(uint256 _tokenId, address _account) external override {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        (uint256 reward, uint256 reward1) = HedgepieInvestorEth.getRewards(
            address(this),
            _tokenId,
            _account
        );

        userAdapter.userShares = adapterInfos[_tokenId].accTokenPerShare;
        userAdapter.userShares1 = adapterInfos[_tokenId].accTokenPerShare1;

        if (reward != 0 && rewardToken != address(0)) {
            amountOut += HedgepieInvestorEth.swapforEth(
                address(this),
                reward,
                rewardToken,
                swapRouter,
                wmatic
            );
        }

        if (reward1 != 0 && rewardToken1 != address(0)) {
            amountOut += HedgepieLibraryMatic.swapforEth(
                address(this),
                reward1,
                rewardToken1,
                swapRouter,
                wmatic
            );
        }

        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(IHedgepieInvestorEth(investor).ybnft()).performanceFee(
                    _tokenId
                )) / 1e4;
            (bool success, ) = payable(treasuryAddr).call{value: taxAmount}("");
            require(success, "Failed to send ether to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }
    }

    function pendingReward(uint256 _tokenId, address _account)
        external
        override
        returns (uint256 reward)
    {
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];
        AdapterInfo memory adapterInfo = adapterInfos[_tokenId];

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
            ((IStrategy(strategy).pendingSushi(pid, _account) * 1e12) /
                adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;

        if (tokenRewards != 0)
            reward = rewardToken == weth
                ? tokenRewards
                : IPancakeRouter(swapRouter).getAmountsOut(
                    tokenRewards,
                    getPaths(rewardToken, weth)
                )[1];
    }

    receive() external payable {}
}
