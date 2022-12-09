// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../../libraries/HedgepieLibraryBsc.sol";
import "../../../interfaces/IHedgepieInvestorBsc.sol";
import "../../../interfaces/IHedgepieAdapterInfoBsc.sol";

interface IStrategy {
    function deposit(uint256, uint256) external;

    function withdraw(uint256, uint256) external;

    function pendingCake(uint256 _pid, address _user)
        external
        view
        returns (uint256);
}

contract ApeswapFarmLPAdapter is BaseAdapterBsc {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _router  address of router
     * @param _wbnb  address of wbnb
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _router,
        address _wbnb,
        string memory _name
    ) {
        pid = _pid;
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        router = _router;
        swapRouter = _router;
        wbnb = _wbnb;
        name = _name;
    }

    /**
     * @notice Deposit with BNB
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn BNB amount
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        // get LP
        amountOut = HedgepieLibraryBsc.getLP(
            IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
            wbnb,
            _amountIn
        );

        // deposit
        uint256 rewardAmt = IBEP20(rewardToken).balanceOf(address(this));

        IBEP20(stakingToken).approve(strategy, amountOut);
        IStrategy(strategy).deposit(pid, amountOut);

        unchecked {
            rewardAmt = IBEP20(rewardToken).balanceOf(address(this))
                - rewardAmt;

            adapterInfo.totalStaked += amountOut;
            if (rewardAmt != 0) {
                adapterInfo.accTokenPerShare +=
                    (rewardAmt * 1e12) /
                    adapterInfo.totalStaked;
            }

            if (userInfo.amount == 0) {
                userInfo.userShares = adapterInfo.accTokenPerShare;
            }
            userInfo.amount += amountOut;
            userInfo.invested += _amountIn;
        }

        // Update adapterInfo contract
        address adapterInfoBscAddr = IHedgepieInvestorBsc(investor)
            .adapterInfo();
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateParticipantInfo(
            _tokenId,
            _account,
            true
        );
    }

    /**
     * @notice Withdraw the deposited BNB
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
        uint256 rewardAmt = IBEP20(rewardToken).balanceOf(address(this));

        // withdraw
        IStrategy(strategy).withdraw(pid, userInfo.amount);

        unchecked {
            amountOut = IBEP20(stakingToken).balanceOf(address(this))
                - amountOut;

            rewardAmt = IBEP20(rewardToken).balanceOf(address(this))
                - rewardAmt;
        }

        if (rewardAmt != 0) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt * 1e12) /
                adapterInfo.totalStaked;
        }
        
        amountOut = HedgepieLibraryBsc.withdrawLP(
            IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
            wbnb,
            amountOut
        );

        (uint256 reward, ) = HedgepieLibraryBsc.getRewards(
            _tokenId,
            address(this),
            _account
        );

        address adapterInfoBnbAddr = IHedgepieInvestorBsc(investor)
            .adapterInfo();
        if (reward != 0) {
            reward = HedgepieLibraryBsc.swapforBnb(
                reward,
                address(this),
                rewardToken,
                router,
                wbnb
            );

            amountOut += reward;

            IHedgepieAdapterInfoBsc(adapterInfoBnbAddr).updateProfitInfo(
                _tokenId,
                reward,
                true
            );
        }

        // Update adapterInfo contract
        IHedgepieAdapterInfoBsc(adapterInfoBnbAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoBsc(adapterInfoBnbAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoBnbAddr).updateParticipantInfo(
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
            if (reward != 0) {
                reward =
                    (reward *
                        IYBNFT(IHedgepieInvestorBsc(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorBsc(investor).treasury())
                    .call{value: reward}("");
                require(success, "Failed to send bnb to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - reward}(
                ""
            );
            require(success, "Failed to send bnb");
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
        returns (uint256)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        (uint256 reward, ) = HedgepieLibraryBsc.getRewards(
            _tokenId,
            address(this),
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;

        uint256 amountOut;
        if (reward != 0) {
            amountOut += HedgepieLibraryBsc.swapforBnb(
                reward,
                address(this),
                rewardToken,
                router,
                wbnb
            );
        }

        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(IHedgepieInvestorBsc(investor).ybnft()).performanceFee(
                    _tokenId
                )) / 1e4;
            (bool success, ) = payable(
                IHedgepieInvestorBsc(investor).treasury()
            ).call{value: taxAmount}("");
            require(success, "Failed to send bnb to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send bnb");

            IHedgepieAdapterInfoBsc(IHedgepieInvestorBsc(investor).adapterInfo())
                .updateProfitInfo(_tokenId, amountOut, true);
        }
    }

    /**
     * @notice Return the pending reward by BNB
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
            ((IStrategy(strategy).pendingCake(pid, address(this)) * 1e12) /
                adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;

        if (tokenRewards != 0)
            reward = rewardToken == wbnb
                ? tokenRewards
                : IPancakeRouter(router).getAmountsOut(
                    tokenRewards,
                    getPaths(rewardToken, wbnb)
                )[1];
    }

    receive() external payable {}
}
