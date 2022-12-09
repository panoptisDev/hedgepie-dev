// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../../libraries/HedgepieLibraryMatic.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

interface IStrategy {
    function deposit(
        address,
        uint256,
        address,
        uint16
    ) external;

    function withdraw(
        address,
        uint256,
        address
    ) external;
}

contract AaveMarketV2AdapterMatic is BaseAdapterMatic {
    uint256 public lastStakedAmt;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _swapRouter swapRouter for swapping tokens
     * @param _name  adatper name
     * @param _wmatic  wmatic address
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
        name = _name;
        wmatic = _wmatic;
    }

    /**
     * @notice Deposit with MATIC
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn MATIC amount
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = HedgepieLibraryMatic.swapOnRouter(
            _amountIn,
            address(this),
            stakingToken,
            swapRouter,
            wmatic
        );

        uint256 rewardAmt;

        rewardAmt =
            IBEP20(rewardToken).balanceOf(address(this)) -
            lastStakedAmt;
        lastStakedAmt = IBEP20(rewardToken).balanceOf(address(this));

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(stakingToken, amountOut, address(this), 0);

        adapterInfo.totalStaked += amountOut;
        if (rewardAmt != 0 && rewardToken != address(0)) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt * 1e12) /
                adapterInfo.totalStaked;
        }

        if (userInfo.amount == 0)
            userInfo.userShares = adapterInfo.accTokenPerShare;

        userInfo.amount += amountOut;
        userInfo.invested += _amountIn;
        lastStakedAmt += amountOut;

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

        return _amountIn;
    }

    /**
     * @notice Withdraw the deposited MATIC
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
        amountOut = IBEP20(stakingToken).balanceOf(address(this));

        rewardAmt =
            IBEP20(rewardToken).balanceOf(address(this)) -
            lastStakedAmt;
        lastStakedAmt = IBEP20(rewardToken).balanceOf(address(this));

        IBEP20(rewardToken).approve(strategy, amountOut);
        IStrategy(strategy).withdraw(
            stakingToken,
            userInfo.amount,
            address(this)
        );

        amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;

        if (rewardAmt != 0 && rewardToken != address(0)) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt * 1e12) /
                adapterInfo.totalStaked;
        }

        amountOut = HedgepieLibraryMatic.swapforMatic(
            amountOut,
            address(this),
            stakingToken,
            swapRouter,
            wmatic
        );

        (uint256 reward, ) = HedgepieLibraryMatic.getRewards(
            _tokenId,
            address(this),
            _account
        );

        uint256 rewardMATIC;
        if (reward != 0) {
            uint256 withdrawAmt = IBEP20(stakingToken).balanceOf(address(this));
            IBEP20(rewardToken).approve(strategy, reward);
            IStrategy(strategy).withdraw(stakingToken, reward, address(this));
            withdrawAmt =
                IBEP20(stakingToken).balanceOf(address(this)) -
                withdrawAmt;
            require(withdrawAmt == reward, "Error: Getting rewards failed");

            rewardMATIC = HedgepieLibraryMatic.swapforMatic(
                reward,
                address(this),
                stakingToken,
                swapRouter,
                wmatic
            );
        }

        address adapterInfoMaticAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();
        amountOut += rewardMATIC;
        if (rewardMATIC != 0) {
            IHedgepieAdapterInfoMatic(adapterInfoMaticAddr).updateProfitInfo(
                _tokenId,
                rewardMATIC,
                true
            );
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
            lastStakedAmt -= userInfo.amount;   
        }

        delete userAdapterInfos[_account][_tokenId];

        if (amountOut != 0) {
            bool success;
            uint256 taxAmount;
            if (rewardMATIC != 0) {
                taxAmount =
                    (rewardMATIC *
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

        if (reward != 0 && rewardToken != address(0)) {
            uint256 withdrawAmt = IBEP20(stakingToken).balanceOf(address(this));
            IBEP20(rewardToken).approve(strategy, reward);
            IStrategy(strategy).withdraw(stakingToken, reward, address(this));
            withdrawAmt =
                IBEP20(stakingToken).balanceOf(address(this)) -
                withdrawAmt;
            require(withdrawAmt == reward, "Error: Getting rewards failed");

            amountOut = HedgepieLibraryMatic.swapforMatic(
                reward,
                address(this),
                stakingToken,
                swapRouter,
                wmatic
            );
            lastStakedAmt -= reward;
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

            IHedgepieAdapterInfoMatic(
                IHedgepieInvestorMatic(investor).adapterInfo()
            ).updateProfitInfo(_tokenId, amountOut, true);
        }
    }

    /**
     * @notice Return the pending reward by MATIC
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

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare;
        if (IBEP20(rewardToken).balanceOf(address(this)) > lastStakedAmt)
            updatedAccTokenPerShare += (((IBEP20(rewardToken).balanceOf(
                address(this)
            ) - lastStakedAmt) * 1e12) / adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;

        if (tokenRewards != 0)
            reward = IPancakeRouter(swapRouter).getAmountsOut(
                tokenRewards,
                getPaths(stakingToken, wmatic)
            )[1];
    }

    receive() external payable {}
}
