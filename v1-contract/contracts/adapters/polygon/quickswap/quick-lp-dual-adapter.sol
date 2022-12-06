// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../../libraries/HedgepieLibraryMatic.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

interface IStrategy {
    function stake(uint256) external;

    function withdraw(uint256) external;

    function getReward() external;

    function earnedA(address) external view returns (uint256);

    function earnedB(address) external view returns (uint256);
}

contract QuickLPDualAdapter is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of 1st reward token
     * @param _rewardToken1  address of 2nd reward token
     * @param _router  address of reward token
     * @param _wmatic  address of wmatic
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _router,
        address _wmatic,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;
        router = _router;
        swapRouter = _router;
        strategy = _strategy;
        wmatic = _wmatic;
        name = _name;
    }

    function _getReward(
        uint256 _tokenId
    ) internal {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];

        // get reward
        uint256 amountOut = IBEP20(rewardToken).balanceOf(address(this));
        uint256 amountOut1 = IBEP20(rewardToken1).balanceOf(address(this));

        IStrategy(strategy).getReward();
        
        unchecked {
            amountOut = IBEP20(rewardToken).balanceOf(address(this))
                - amountOut;

            amountOut1 = IBEP20(rewardToken1).balanceOf(address(this))
                - amountOut1;
        }

        if (amountOut != 0 && adapterInfo.totalStaked != 0) {
            adapterInfo.accTokenPerShare +=
                (amountOut * 1e12) /
                adapterInfo.totalStaked;
        }

        if (amountOut1 != 0 && adapterInfo.totalStaked != 0) {
            adapterInfo.accTokenPerShare1 +=
                (amountOut1 * 1e12) /
                adapterInfo.totalStaked;
        }
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
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        // get stakingToken
        amountOut = HedgepieLibraryMatic.getLP(
            IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
            wmatic,
            _amountIn
        );

        // deposit
        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).stake(amountOut);

        unchecked {
            adapterInfo.totalStaked += amountOut;

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
        onlyInvestor
        returns (uint256 amountOut)
    {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        // withdraw
        _getReward(_tokenId);
        IStrategy(strategy).withdraw(userInfo.amount);

        unchecked {
            amountOut = IBEP20(stakingToken).balanceOf(address(this))
                - amountOut;
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

        if (rewardETH != 0) {
            IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                rewardETH,
                true
            );

            amountOut += rewardETH;
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
            if (rewardETH != 0) {
                rewardETH =
                    (rewardETH *
                        IYBNFT(IHedgepieInvestorMatic(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(
                    IHedgepieInvestorMatic(investor).treasury()
                ).call{value: rewardETH}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - rewardETH}(
                ""
            );
            require(success, "Failed to send ether");
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
        onlyInvestor
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        _getReward(_tokenId);

        (uint256 reward, uint256 reward1) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;
        userInfo.userShares1 = adapterInfos[_tokenId].accTokenPerShare1;

        if (reward != 0) {
            amountOut = HedgepieLibraryMatic.swapforMatic(
                reward,
                address(this),
                rewardToken,
                swapRouter,
                wmatic
            );
        }

        if (reward1 != 0) {
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

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
            ((IStrategy(strategy).earnedA(address(this)) * 1e12) /
                adapterInfo.totalStaked);
        uint256 updatedAccTokenPerShare1 = adapterInfo.accTokenPerShare1 +
            ((IStrategy(strategy).earnedB(address(this)) * 1e12) /
                adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;
        uint256 tokenRewards1 = ((updatedAccTokenPerShare1 -
            userInfo.userShares1) * userInfo.amount) / 1e12;

        if (tokenRewards != 0)
            reward = rewardToken == wmatic
                ? tokenRewards
                : IPancakeRouter(swapRouter).getAmountsOut(
                    tokenRewards,
                    getPaths(rewardToken, wmatic)
                )[1];

        if (tokenRewards1 != 0)
            reward += rewardToken1 == wmatic
                ? tokenRewards1
                : IPancakeRouter(swapRouter).getAmountsOut(
                    tokenRewards1,
                    getPaths(rewardToken1, wmatic)
                )[1];
    }

    receive() external payable {}
}
