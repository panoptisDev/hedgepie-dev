// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../../libraries/HedgepieLibraryMatic.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

interface IStrategy {
    function stake(uint256) external;

    function withdraw(uint256) external;

    function getReward() external;

    function earned(address account) external view returns (uint256);
}

contract QuickStakeAdapter is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _swapRouter  address of swap router
     * @param _wmatic  address of wmatic
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _swapRouter,
        address _wmatic,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        swapRouter = _swapRouter;
        wmatic = _wmatic;
        name = _name;
    }

    function _getReward(
        uint256 _tokenId
    ) internal {
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];

        // get reward
        uint256 amountOut = IBEP20(rewardToken).balanceOf(address(this));

        IStrategy(strategy).getReward();
        
        unchecked {
            amountOut = IBEP20(rewardToken).balanceOf(address(this))
                - amountOut;
        }

        if (amountOut != 0 && adapterInfo.totalStaked != 0) {
            adapterInfo.accTokenPerShare +=
                (amountOut * 1e12) /
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
        amountOut = HedgepieLibraryMatic.swapOnRouter(
            _amountIn,
            address(this),
            stakingToken,
            swapRouter,
            wmatic
        );

        // deposit
        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).stake(amountOut);

        unchecked {
            adapterInfo.totalStaked += amountOut;

            if (userInfo.amount == 0) {
                userInfo.userShares = adapterInfo.accTokenPerShare;
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

        amountOut = HedgepieLibraryMatic.swapforMatic(
            amountOut,
            address(this),
            stakingToken,
            swapRouter,
            wmatic
        );

        (uint256 rewardAmt, ) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        address adapterInfoMaticAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();

        if(rewardAmt != 0) {
            rewardAmt = HedgepieLibraryMatic.swapforMatic(
                rewardAmt,
                address(this),
                rewardToken,
                swapRouter,
                wmatic
            );

            IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateProfitInfo(
                _tokenId,
                rewardAmt,
                true
            );

            amountOut += rewardAmt;
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

        unchecked {
            adapterInfo.totalStaked -= userInfo.amount;
        }

        delete userAdapterInfos[_account][_tokenId];

        if (amountOut != 0) {
            bool success;
            if (rewardAmt != 0) {
                rewardAmt =
                    (rewardAmt *
                        IYBNFT(IHedgepieInvestorMatic(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorMatic(investor).treasury())
                    .call{value: rewardAmt}("");
                require(success, "Failed to send matic to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - rewardAmt}("");
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

        if (reward != 0) {
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
            ((IStrategy(strategy).earned(address(this)) * 1e12) /
                adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;

        if(tokenRewards < userInfo.amount) return 0;

        if (stakingToken != wmatic)
            reward += IPancakeRouter(swapRouter).getAmountsOut(
                tokenRewards,
                getPaths(stakingToken, wmatic)
            )[1];
    }

    receive() external payable {}
}
