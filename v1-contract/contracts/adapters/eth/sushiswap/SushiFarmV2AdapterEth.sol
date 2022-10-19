// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

interface IStrategy {
    function deposit(
        uint256 _pid,
        uint256 _amount,
        address _to
    ) external;

    function withdrawAndHarvest(
        uint256 _pid,
        uint256 _amount,
        address _to
    ) external;

    function pendingSushi(uint256 _pid, address _user)
        external
        view
        returns (uint256);
}

contract SushiFarmV2AdapterEth is BaseAdapterEth {
    /**
     * @notice Construct
     * @param _pid  strategy pool id
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _router lp provider router address
     * @param _swapRouter swapRouter for swapping tokens
     * @param _name  adatper name
     * @param _weth  weth address
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _router,
        address _swapRouter,
        string memory _name,
        address _weth
    ) {
        pid = _pid;
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;
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
    ) external payable override returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        uint256 amountOut;
        if (router == address(0)) {
            amountOut = HedgepieLibraryEth.swapOnRouter(
                address(this),
                _amountIn,
                stakingToken,
                swapRouter,
                weth
            );
        } else {
            amountOut = HedgepieLibraryEth.getLP(
                IYBNFT.Adapter(0, stakingToken, address(this)),
                weth,
                _amountIn,
                0
            );
        }
        uint256 rewardAmt0;
        uint256 rewardAmt1;

        rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this));
        rewardAmt1 = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this))
            : 0;

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(pid, amountOut, address(this));

        rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this)) - rewardAmt0;
        rewardAmt1 = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this)) - rewardAmt1
            : 0;

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
        userInfo.amount += amountOut;
        userInfo.invested += _amountIn;

        // Update adapterInfo contract
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateTVLInfo(_tokenId, _amountIn, true);
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateTradedInfo(_tokenId, _amountIn, true);
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateParticipantInfo(_tokenId, _account, true);

        return _amountIn;
    }

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
        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this));
        rewardAmt1 = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this))
            : 0;

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).withdrawAndHarvest(
            pid,
            userInfo.amount,
            address(this)
        );

        rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this)) - rewardAmt0;
        rewardAmt1 = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this)) - rewardAmt1
            : 0;
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
        amountOut += rewardETH;
        if (rewardETH != 0) {
            IHedgepieAdapterInfoEth(
                IHedgepieInvestorEth(investor).adapterInfo()
            ).updateProfitInfo(_tokenId, rewardETH, true);
        }

        // Update adapterInfo contract
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateTVLInfo(_tokenId, userInfo.invested, false);
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateTradedInfo(_tokenId, userInfo.invested, true);
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateParticipantInfo(_tokenId, _account, false);

        userInfo.amount = 0;
        userInfo.invested = 0;
        userInfo.userShares = 0;
        userInfo.userShares1 = 0;
        adapterInfo.totalStaked -= userInfo.amount;

        if (amountOut != 0) {
            bool success;
            uint256 taxAmount;
            if (rewardETH != 0) {
                taxAmount =
                    (rewardETH *
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

        return amountOut;
    }

    function claim(uint256 _tokenId, address _account)
        external
        payable
        override
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        (uint256 reward, uint256 reward1) = HedgepieLibraryEth.getRewards(
            address(this),
            _tokenId,
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;
        userInfo.userShares1 = adapterInfos[_tokenId].accTokenPerShare1;

        uint256 amountOut;
        if (reward != 0 && rewardToken != address(0)) {
            amountOut += HedgepieLibraryEth.swapforEth(
                address(this),
                reward,
                rewardToken,
                swapRouter,
                weth
            );
        }

        if (reward1 != 0 && rewardToken1 != address(0)) {
            amountOut += HedgepieLibraryEth.swapforEth(
                address(this),
                reward1,
                rewardToken1,
                swapRouter,
                weth
            );
        }

        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(IHedgepieInvestorEth(investor).ybnft()).performanceFee(
                    _tokenId
                )) / 1e4;
            (bool success, ) = payable(
                IHedgepieInvestorEth(investor).treasury()
            ).call{value: taxAmount}("");
            require(success, "Failed to send ether to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateProfitInfo(_tokenId, amountOut, true);

        return amountOut;
    }

    function pendingReward(uint256 _tokenId, address _account)
        external
        view
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
