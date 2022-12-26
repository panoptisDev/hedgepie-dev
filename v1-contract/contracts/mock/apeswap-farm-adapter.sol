// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../libraries/HedgepieLibraryMatic.sol";
import "../interfaces/IHedgepieInvestorMatic.sol";
import "../interfaces/IHedgepieAdapterInfoMatic.sol";

import "../interfaces/IStargateRouter.sol";
import "../interfaces/IStargateReceiver.sol";

interface IStrategy {
    function deposit(
        uint256,
        uint256,
        address
    ) external;

    function withdrawAndHarvest(
        uint256,
        uint256,
        address
    ) external;

    function harvest(uint256, address) external;

    function pendingBanana(uint256, address) external view returns (uint256);
}

contract ApeswapFarmAdapterMock is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _pid  number of poolid
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of 1st reward token
     * @param _rewardToken1  address of 2nd reward token
     * @param _router  address of reward token
     * @param _wmatic  address of wmatic
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _router,
        address _wmatic,
        string memory _name
    ) {
        pid = _pid;
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;
        strategy = _strategy;
        router = _router;
        swapRouter = _router;
        wmatic = _wmatic;
        name = _name;
    }

    /**
     * @notice Deposit with Matic
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn Matic amount
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        // get LP
        amountOut = HedgepieLibraryMatic.getLP(
            IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
            wmatic,
            _amountIn
        );

        uint256 rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this));
        uint256 rewardAmt1 = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this))
            : 0;

        // deposit
        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(pid, amountOut, address(this));

        unchecked {
            rewardAmt0 =
                IBEP20(rewardToken).balanceOf(address(this)) -
                rewardAmt0;
            rewardAmt1 = rewardToken1 != address(0)
                ? IBEP20(rewardToken1).balanceOf(address(this)) - rewardAmt1
                : 0;

            adapterInfo.totalStaked += amountOut;
            if (rewardAmt0 != 0) {
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
        }

        // Update adapterInfo contract
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
     * @notice Withdraw the deposited Matic
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

        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        uint256 rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this));
        uint256 rewardAmt1 = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this))
            : 0;

        IStrategy(strategy).withdrawAndHarvest(
            pid,
            userInfo.amount,
            address(this)
        );

        unchecked {
            amountOut =
                IBEP20(stakingToken).balanceOf(address(this)) -
                amountOut;

            rewardAmt0 =
                IBEP20(rewardToken).balanceOf(address(this)) -
                rewardAmt0;
            rewardAmt1 = rewardToken1 != address(0)
                ? IBEP20(rewardToken1).balanceOf(address(this)) - rewardAmt1
                : 0;
        }

        if (rewardAmt0 != 0) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt0 * 1e12) /
                adapterInfo.totalStaked;
        }

        if (rewardAmt1 != 0 && rewardToken1 != address(0)) {
            adapterInfo.accTokenPerShare1 +=
                (rewardAmt1 * 1e12) /
                adapterInfo.totalStaked;
        }

        amountOut = HedgepieLibraryMatic.withdrawLP(
            IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
            wmatic,
            amountOut
        );

        (uint256 reward, uint256 reward1) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        uint256 rewardMatic;
        if (reward != 0) {
            rewardMatic = HedgepieLibraryMatic.swapforMatic(
                reward,
                address(this),
                rewardToken,
                swapRouter,
                wmatic
            );
        }

        if (reward1 != 0) {
            rewardMatic += HedgepieLibraryMatic.swapforMatic(
                reward1,
                address(this),
                rewardToken1,
                swapRouter,
                wmatic
            );
        }

        address adapterInfoMaticAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();
        if (rewardMatic != 0) {
            IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateProfitInfo(
                _tokenId,
                rewardMatic,
                true
            );

            amountOut += rewardMatic;
        }

        // Update adapterInfo contract
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

        adapterInfo.totalStaked -= userInfo.amount;
        delete userAdapterInfos[_account][_tokenId];

        if (amountOut != 0) {
            bool success;
            uint256 taxAmount;
            if (rewardMatic != 0) {
                taxAmount =
                    (rewardMatic *
                        IYBNFT(IHedgepieInvestorMatic(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(
                    IHedgepieInvestorMatic(investor).treasury()
                ).call{value: taxAmount}("");
                require(success, "Failed to send matic to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send matic");
        }
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
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        uint256 rewardAmt = IBEP20(rewardToken).balanceOf(address(this));

        IStrategy(strategy).harvest(pid, address(this));

        unchecked {
            rewardAmt =
                IBEP20(rewardToken).balanceOf(address(this)) -
                rewardAmt;

            adapterInfo.accTokenPerShare +=
                (rewardAmt * 1e12) /
                adapterInfo.totalStaked;
        }

        (uint256 reward, ) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;

        if (reward != 0) {
            amountOut = HedgepieLibraryMatic.swapforMatic(
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
            require(success, "Failed to send matic to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send matic");
        }

        IHedgepieAdapterInfoMatic(
            IHedgepieInvestorMatic(investor).adapterInfo()
        ).updateProfitInfo(_tokenId, amountOut, true);
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
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];
        AdapterInfo memory adapterInfo = adapterInfos[_tokenId];

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
            ((IStrategy(strategy).pendingBanana(pid, address(this)) * 1e12) /
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
