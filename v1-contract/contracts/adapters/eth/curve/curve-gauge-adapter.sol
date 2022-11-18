// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

interface IGauge {
    function deposit(uint256 _amount) external;

    function withdraw(uint256 _amount) external;

    function integrate_fraction(address) external view returns (uint256);
}

interface IPool {
    function add_liquidity(uint256[2] memory, uint256) external payable;

    function add_liquidity(uint256[3] memory, uint256) external payable;

    function add_liquidity(uint256[4] memory, uint256) external payable;

    function remove_liquidity_one_coin(
        uint256,
        int128,
        uint256
    ) external;
}

interface IMint {
    function mint(address) external;

    function minted(address, address) external view returns (uint256);
}

contract CurveGaugeAdapter is BaseAdapterEth {
    Curve curveInfo;
    struct Curve {
        address rewardMinter;
        address liquidityToken;
        uint128 lpCnt;
        uint128 lpOrder;
    }

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _router lp provider router address
     * @param _swapRouter swapRouter for swapping tokens
     * @param _weth  weth address
     * @param _curve  curve struct info
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _router,
        address _swapRouter,
        address _weth,
        Curve memory _curve,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        router = _router;
        swapRouter = _swapRouter;
        weth = _weth;
        curveInfo = _curve;
        name = _name;
    }

    /**
     * @notice Get curve LP
     * @param _amountIn  amount of liquidityToken
     * @param _isETH  bool for liquidityToken is ETH
     */
    function _getCurveLP(uint256 _amountIn, bool _isETH)
        internal
        returns (uint256 amountOut)
    {
        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        if (curveInfo.lpCnt == 2) {
            uint256[2] memory amounts;
            amounts[curveInfo.lpOrder] = _amountIn;

            IPool(router).add_liquidity{value: _isETH ? _amountIn : 0}(
                amounts,
                0
            );
        } else if (curveInfo.lpCnt == 3) {
            uint256[3] memory amounts;
            amounts[curveInfo.lpOrder] = _amountIn;

            IPool(router).add_liquidity{value: _isETH ? _amountIn : 0}(
                amounts,
                0
            );
        } else if (curveInfo.lpCnt == 4) {
            uint256[4] memory amounts;
            amounts[curveInfo.lpOrder] = _amountIn;

            IPool(router).add_liquidity{value: _isETH ? _amountIn : 0}(
                amounts,
                0
            );
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
     * @param _isETH  bool for liquidityToken is ETH
     */
    function _removeCurveLP(uint256 _amountIn, bool _isETH)
        internal
        returns (uint256 amountOut)
    {
        amountOut = _isETH
            ? address(this).balance
            : IBEP20(curveInfo.liquidityToken).balanceOf(address(this));

        IBEP20(stakingToken).approve(router, _amountIn);
        IPool(router).remove_liquidity_one_coin(
            _amountIn,
            int128(curveInfo.lpOrder),
            0
        );

        unchecked {
            amountOut = _isETH
                ? address(this).balance - amountOut
                : IBEP20(curveInfo.liquidityToken).balanceOf(address(this)) -
                    amountOut;
        }
    }

    /**
     * @notice Remove CRV reward
     */
    function _getReward(uint256 _tokenId) internal returns (uint256 amountOut) {
        // get CRV reward
        amountOut = IBEP20(rewardToken).balanceOf(address(this));
        IMint(curveInfo.rewardMinter).mint(strategy);
        amountOut = IBEP20(rewardToken).balanceOf(address(this)) - amountOut;
        if (amountOut != 0 && adapterInfos[_tokenId].totalStaked != 0) {
            adapterInfos[_tokenId].accTokenPerShare +=
                (amountOut * 1e12) /
                adapterInfos[_tokenId].totalStaked;
        }
    }

    /**
     * @notice Deposit to yearn adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of eth
     */
    function deposit(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) external payable override returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");

        bool isETH = curveInfo.liquidityToken == weth;
        if (isETH) {
            amountOut = _amountIn;
        } else {
            amountOut = HedgepieLibraryEth.swapOnRouter(
                address(this),
                _amountIn,
                curveInfo.liquidityToken,
                swapRouter,
                weth
            );
            IBEP20(curveInfo.liquidityToken).approve(router, amountOut);
        }

        // get curve lp
        amountOut = _getCurveLP(amountOut, isETH);

        IBEP20(stakingToken).approve(strategy, amountOut);
        IGauge(strategy).deposit(amountOut);

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
        returns (uint256 amountOut)
    {
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];

        _getReward(_tokenId);

        amountOut = IBEP20(stakingToken).balanceOf(address(this));
        IGauge(strategy).withdraw(userInfo.amount);
        unchecked {
            amountOut =
                IBEP20(stakingToken).balanceOf(address(this)) -
                amountOut;
        }

        // withdraw liquiditytoken from curve pool
        bool isETH = curveInfo.liquidityToken == weth;
        amountOut = _removeCurveLP(amountOut, isETH);
        if (!isETH) {
            amountOut = HedgepieLibraryEth.swapforEth(
                address(this),
                amountOut,
                curveInfo.liquidityToken,
                swapRouter,
                weth
            );
        }

        (uint256 reward, ) = HedgepieLibraryEth.getRewards(
            address(this),
            _tokenId,
            _account
        );

        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        if (reward != 0) {
            reward = HedgepieLibraryEth.swapforEth(
                address(this),
                reward,
                rewardToken,
                swapRouter,
                weth
            );

            IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                reward,
                true
            );

            unchecked {
                amountOut += reward;
                reward =
                    (reward *
                        IYBNFT(IHedgepieInvestorEth(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
            }
        }

        if (amountOut != 0) {
            bool success;
            if (reward != 0) {
                (success, ) = payable(IHedgepieInvestorEth(investor).treasury())
                    .call{value: reward}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - reward}("");
            require(success, "Failed to send ether");
        }

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
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        _getReward(_tokenId);

        (amountOut, ) = HedgepieLibraryEth.getRewards(
            address(this),
            _tokenId,
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;

        if (amountOut != 0) {
            amountOut = HedgepieLibraryEth.swapforEth(
                address(this),
                amountOut,
                rewardToken,
                swapRouter,
                weth
            );

            if (amountOut != 0) {
                uint256 taxAmount = (amountOut *
                    IYBNFT(IHedgepieInvestorEth(investor).ybnft())
                        .performanceFee(_tokenId)) / 1e4;
                (bool success, ) = payable(
                    IHedgepieInvestorEth(investor).treasury()
                ).call{value: taxAmount}("");
                require(success, "Failed to send ether to Treasury");

                (success, ) = payable(_account).call{
                    value: amountOut - taxAmount
                }("");
                require(success, "Failed to send ether");

                IHedgepieAdapterInfoEth(
                    IHedgepieInvestorEth(investor).adapterInfo()
                ).updateProfitInfo(_tokenId, amountOut, true);
            }
        }
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
        AdapterInfo memory adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];

        uint256 pending = IGauge(strategy).integrate_fraction(address(this));
        pending -= IMint(curveInfo.rewardMinter).minted(
            strategy,
            address(this)
        );

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
            ((pending * 1e12) / adapterInfo.totalStaked);

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
