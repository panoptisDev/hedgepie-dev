// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../../libraries/HedgepieLibraryMatic.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

interface IStrategy {
    function deposit(uint256) external;

    function withdraw(uint256) external;

    function claim_rewards(address) external;

    function claimable_reward(address, address)
        external
        view
        returns (uint256);
}

interface IPool {
    function add_liquidity(uint256[2] memory, uint256, bool) external payable;

    function add_liquidity(uint256[3] memory, uint256, bool) external payable;

    function add_liquidity(uint256[4] memory, uint256, bool) external payable;

    function add_liquidity(uint256[2] memory, uint256) external payable;

    function add_liquidity(uint256[3] memory, uint256) external payable;

    function add_liquidity(uint256[4] memory, uint256) external payable;

    function remove_liquidity_one_coin(
        uint256,
        int128,
        uint256,
        bool
    ) external;

    function remove_liquidity_one_coin(
        uint256,
        uint256,
        uint256
    ) external;
}

contract CurveLPAdapter is BaseAdapterMatic {
    Curve curveInfo;
    struct Curve {
        address liquidityToken;
        uint128 lpCnt;
        uint128 lpOrder;
        bool underlying;
        bool isDeposit;
    }

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _rewardToken1  address of reward token1
     * @param _router lp provider router address
     * @param _swapRouter swapRouter for swapping tokens
     * @param _wmatic  wmatic address
     * @param _curve  curve struct info
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _router,
        address _swapRouter,
        address _wmatic,
        Curve memory _curve,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;
        strategy = _strategy;
        router = _router;
        swapRouter = _swapRouter;
        wmatic = _wmatic;
        curveInfo = _curve;
        name = _name;
    }

    /**
     * @notice Get curve LP
     * @param _amountIn  amount of liquidityToken
     * @param _isMatic  bool for liquidityToken is Matic
     */
    function _getCurveLP(uint256 _amountIn, bool _isMatic)
        internal
        returns (uint256 amountOut)
    {
        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        if(curveInfo.isDeposit) {
            if (curveInfo.lpCnt == 2) {
                uint256[2] memory amounts;
                amounts[curveInfo.lpOrder] = _amountIn;

                IPool(router).add_liquidity{value: _isMatic ? _amountIn : 0}(
                    amounts,
                    0
                );
            } else if (curveInfo.lpCnt == 3) {
                uint256[3] memory amounts;
                amounts[curveInfo.lpOrder] = _amountIn;

                IPool(router).add_liquidity{value: _isMatic ? _amountIn : 0}(
                    amounts,
                    0
                );
            } else if (curveInfo.lpCnt == 4) {
                uint256[4] memory amounts;
                amounts[curveInfo.lpOrder] = _amountIn;

                IPool(router).add_liquidity{value: _isMatic ? _amountIn : 0}(
                    amounts,
                    0
                );
            }
        } else {
            if (curveInfo.lpCnt == 2) {
                uint256[2] memory amounts;
                amounts[curveInfo.lpOrder] = _amountIn;

                IPool(router).add_liquidity{value: _isMatic ? _amountIn : 0}(
                    amounts,
                    0,
                    curveInfo.underlying
                );
            } else if (curveInfo.lpCnt == 3) {
                uint256[3] memory amounts;
                amounts[curveInfo.lpOrder] = _amountIn;

                IPool(router).add_liquidity{value: _isMatic ? _amountIn : 0}(
                    amounts,
                    0,
                    curveInfo.underlying
                );
            } else if (curveInfo.lpCnt == 4) {
                uint256[4] memory amounts;
                amounts[curveInfo.lpOrder] = _amountIn;

                IPool(router).add_liquidity{value: _isMatic ? _amountIn : 0}(
                    amounts,
                    0,
                    curveInfo.underlying
                );
            }
        }

        unchecked {
            amountOut =
                IBEP20(stakingToken).balanceOf(address(this)) -
                amountOut;
        }
    }

    /**
     * @notice Remove LP from curve
     * @param _amountIn  amount of LP to withdraw
     * @param _isMatic  bool for liquidityToken is Matic
     */
    function _removeCurveLP(uint256 _amountIn, bool _isMatic)
        internal
        returns (uint256 amountOut)
    {
        amountOut = _isMatic
            ? address(this).balance
            : IBEP20(curveInfo.liquidityToken).balanceOf(address(this));

        IBEP20(stakingToken).approve(router, _amountIn);

        if(curveInfo.isDeposit) {
            IPool(router).remove_liquidity_one_coin(
                _amountIn,
                curveInfo.lpOrder,
                0
            );
        } else {
            IPool(router).remove_liquidity_one_coin(
                _amountIn,
                int128(curveInfo.lpOrder),
                0,
                curveInfo.underlying
            );
        }

        unchecked {
            amountOut = _isMatic
                ? address(this).balance - amountOut
                : IBEP20(curveInfo.liquidityToken).balanceOf(address(this)) -
                    amountOut;
        }
    }

    /**
     * @notice Remove CRV reward
     */
    function _getReward(
        uint256 _tokenId
    ) internal {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];

        // get CRV reward
        uint256 amountOut = IBEP20(rewardToken).balanceOf(address(this));
        uint256 amountOut1 = rewardToken1 == address(0) ? 0
            : IBEP20(rewardToken1).balanceOf(address(this));

        IStrategy(strategy).claim_rewards(address(this));
        
        unchecked {
            amountOut = IBEP20(rewardToken).balanceOf(address(this))
                - amountOut;

            amountOut1 = rewardToken1 == address(0) ? 0
                : (IBEP20(rewardToken1).balanceOf(address(this))
                - amountOut1);
        }

        if (amountOut != 0 && adapterInfo.totalStaked != 0) {
            adapterInfo.accTokenPerShare +=
                (amountOut * 1e12) /
                adapterInfo.totalStaked;
        }

        if (amountOut1 != 0 && adapterInfo.totalStaked != 0) {
            adapterInfo.accTokenPerShare +=
                (amountOut1 * 1e12) /
                adapterInfo.totalStaked;
        }
    }

    /**
     * @notice Deposit to yearn adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of Matic
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");

        bool isMatic = curveInfo.liquidityToken == wmatic;
        if (isMatic) {
            amountOut = _amountIn;
        } else {
            amountOut = HedgepieLibraryMatic.swapOnRouter(
                _amountIn,
                address(this),
                curveInfo.liquidityToken,
                swapRouter,
                wmatic
            );
            IBEP20(curveInfo.liquidityToken).approve(router, amountOut);
        }

        // get curve lp
        amountOut = _getCurveLP(amountOut, isMatic);

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(amountOut);

        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        unchecked {
            // update adapter info
            adapterInfo.totalStaked += amountOut;

            if (userInfo.amount == 0) {
                userInfo.userShares = adapterInfo.accTokenPerShare;
            }

            // update user info
            userInfo.amount += amountOut;
            userInfo.invested += _amountIn;
        }

        address adapterInfoMaticAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateParticipantInfo(
            _tokenId,
            _account,
            true
        );
    }

    /**
     * @notice Withdraw to yearn adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     */
    function withdraw(uint256 _tokenId, address _account)
        external
        payable
        override
        onlyInvestor
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        _getReward(_tokenId);

        amountOut = IBEP20(stakingToken).balanceOf(address(this));
        IStrategy(strategy).withdraw(userInfo.amount);
        unchecked {
            amountOut =
                IBEP20(stakingToken).balanceOf(address(this)) -
                amountOut;
        }

        // withdraw liquiditytoken from curve pool
        bool isMatic = curveInfo.liquidityToken == wmatic;
        amountOut = _removeCurveLP(amountOut, isMatic);
        if (!isMatic) {
            amountOut = HedgepieLibraryMatic.swapforMatic(
                amountOut,
                address(this),
                curveInfo.liquidityToken,
                swapRouter,
                wmatic
            );
        }

        (uint256 reward, uint256 reward1) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        address adapterInfoMaticAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();
        if (reward != 0) {
            reward = HedgepieLibraryMatic.swapforMatic(
                reward,
                address(this),
                rewardToken,
                swapRouter,
                wmatic
            );
        }

        if(reward1 != 0) {
            reward += HedgepieLibraryMatic.swapforMatic(
                reward1,
                address(this),
                rewardToken1,
                swapRouter,
                wmatic
            );
        }

        if(reward != 0) {
            IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateProfitInfo(
                _tokenId,
                reward,
                true
            );

            unchecked {
                amountOut += reward;
                reward =
                    (reward *
                        IYBNFT(IHedgepieInvestorMatic(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
            }
        }

        if (amountOut != 0) {
            bool success;
            if (reward != 0) {
                (success, ) = payable(IHedgepieInvestorMatic(investor).treasury())
                    .call{value: reward}("");
                require(success, "Failed to send matic to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - reward}("");
            require(success, "Failed to send matic");
        }

        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        // update adapter info
        adapterInfos[_tokenId].totalStaked -= userInfo.amount;
        delete userAdapterInfos[_account][_tokenId];
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

        _getReward(_tokenId);

        (amountOut, ) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;

        if (amountOut != 0) {
            amountOut = HedgepieLibraryMatic.swapforMatic(
                amountOut,
                address(this),
                rewardToken,
                swapRouter,
                wmatic
            );

            uint256 taxAmount = (amountOut *
                IYBNFT(IHedgepieInvestorMatic(investor).ybnft())
                    .performanceFee(_tokenId)) / 1e4;
            (bool success, ) = payable(
                IHedgepieInvestorMatic(investor).treasury()
            ).call{value: taxAmount}("");
            require(success, "Failed to send matic to Treasury");

            (success, ) = payable(_account).call{
                value: amountOut - taxAmount
            }("");
            require(success, "Failed to send matic");

            IHedgepieAdapterInfoMatic(
                IHedgepieInvestorMatic(investor).adapterInfo()
            ).updateProfitInfo(_tokenId, amountOut, true);
        }
    }

    /**
     * @notice Return the pending reward by Matic
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     */
    function pendingReward(uint256 _tokenId, address _account)
        external
        view
        override
        returns (uint256 reward)
    {
        AdapterInfo memory adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];

        uint256 pending = IStrategy(strategy).claimable_reward(
            address(this),
            rewardToken
        );

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
            ((pending * 1e12) / adapterInfo.totalStaked);

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