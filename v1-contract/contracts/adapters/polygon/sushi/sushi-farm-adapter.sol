// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryMatic.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

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

contract SushiSwapLPAdapterMatic is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _pid  strategy pool id
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _rewardToken1  address of reward token1
     * @param _router lp provider router address
     * @param _swapRouter swapRouter for swapping tokens
     * @param _wmatic  wmatic address
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _router,
        address _swapRouter,
        address _wmatic,
        string memory _name
    ) {
        pid = _pid;
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;
        strategy = _strategy;
        router = _router;
        swapRouter = _swapRouter;
        name = _name;
        wmatic = _wmatic;
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

        if (router == address(0)) {
            amountOut = HedgepieLibraryMatic.swapOnRouter(
                _amountIn,
                address(this),
                stakingToken,
                swapRouter,
                wmatic
            );
        } else {
            amountOut = HedgepieLibraryMatic.getLP(
                IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
                wmatic,
                _amountIn
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
            amountOut = HedgepieLibraryMatic.swapforMatic(
                amountOut,
                address(this),
                stakingToken,
                swapRouter,
                wmatic
            );
        } else {
            amountOut = HedgepieLibraryMatic.withdrawLP(
                IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
                wmatic,
                amountOut
            );
        }

        (uint256 reward, uint256 reward1) = HedgepieLibraryMatic.getRewards(
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

        if (reward1 != 0) {
            rewardETH += HedgepieLibraryMatic.swapforMatic(
                reward1,
                address(this),
                rewardToken1,
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

        (uint256 reward, uint256 reward1) = HedgepieLibraryMatic.getRewards(
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

        if (reward1 != 0 && rewardToken1 != address(0)) {
            amountOut += HedgepieLibraryMatic.swapforMatic(
                reward1,
                address(this),
                rewardToken1,
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
            ((IStrategy(strategy).pendingSushi(pid, address(this)) * 1e12) /
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
