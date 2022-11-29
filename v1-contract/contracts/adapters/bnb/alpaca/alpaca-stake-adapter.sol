// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterBsc.sol";

import "../../../libraries/HedgepieLibraryBsc.sol";
import "../../../interfaces/IHedgepieInvestorBsc.sol";
import "../../../interfaces/IHedgepieAdapterInfoBsc.sol";

interface IFairLaunch {
    function deposit(address, uint256, uint256) external;

    function withdraw(address,uint256,uint256) external;

    function pendingAlpaca(uint256 pid, address user)
        external
        view
        returns (uint256);
}

contract AlpacaStakeAdapter is BaseAdapterBsc {
    address public immutable wrapToken;

    /**
     * @notice Construct
     * @param _pid  number of pID
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _swapRouter  address of reward token
     * @param _wrapToken  address of wrap token
     * @param _wbnb  address of wbnb
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _swapRouter,
        address _wrapToken,
        address _wbnb,
        string memory _name
    ) {
        pid = _pid;
        wbnb = _wbnb;
        strategy = _strategy;
        wrapToken = _wrapToken;
        swapRouter = _swapRouter;
        rewardToken = _rewardToken;
        stakingToken = _stakingToken;
        name = _name;
    }

    /**
     * @notice Get ib Wrapped token
     * @param _amountIn  Amount of underlying token
     */
    function _getWrapToken(uint256 _amountIn) 
        internal 
        returns(uint256 amountOut) 
    {
        amountOut = IBEP20(stakingToken).balanceOf(address(this));
        
        IBEP20(wrapToken).approve(stakingToken, _amountIn);
        IWrap(stakingToken).deposit(_amountIn);
        
        unchecked {
            amountOut =
                IBEP20(stakingToken).balanceOf(address(this)) -
                amountOut;
        }
    }

    /**
     * @notice Unwrap ib token
     * @param _amountIn  Amount of ib token
     */
    function _unwrapToken(uint256 _amountIn) 
        internal 
        returns(uint256 amountOut) 
    {
        amountOut = IBEP20(wrapToken).balanceOf(address(this));
        
        IWrap(stakingToken).withdraw(_amountIn);
        
        unchecked {
            amountOut =
                IBEP20(wrapToken).balanceOf(address(this)) -
                amountOut;
        }
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

        // get wrap token
        amountOut = HedgepieLibraryBsc.swapOnRouter(
            _amountIn,
            address(this),
            wrapToken,
            swapRouter,
            wbnb
        );

        // get ib wrapped token
        amountOut = _getWrapToken(amountOut);

        // stake to fairlaunch
        uint256 rewardAmt = IBEP20(rewardToken).balanceOf(address(this));

        IBEP20(stakingToken).approve(strategy, amountOut);
        IFairLaunch(strategy).deposit(address(this), pid, amountOut);

        rewardAmt = IBEP20(rewardToken).balanceOf(address(this)) - rewardAmt;

        adapterInfo.totalStaked += amountOut;
        if (rewardAmt != 0 && rewardToken != address(0)) {
            adapterInfo.accTokenPerShare +=
                (rewardAmt * 1e12) /
                adapterInfo.totalStaked;
        }

        if (userInfo.amount == 0) {
            userInfo.userShares = adapterInfo.accTokenPerShare;
        }
        userInfo.amount += amountOut;
        userInfo.invested += _amountIn;

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

        // withdraw from MasterChef
        IFairLaunch(strategy).withdraw(
            address(this),
            pid,
            userInfo.amount
        );

        unchecked {
            amountOut = IBEP20(stakingToken).balanceOf(address(this)) - amountOut;
            rewardAmt = IBEP20(rewardToken).balanceOf(address(this)) - rewardAmt;
        }

        // unwrap token
        amountOut = _unwrapToken(amountOut);

        // swap wraptoken to BNB
        amountOut = HedgepieLibraryBsc.swapforBnb(
            amountOut,
            address(this),
            wrapToken,
            swapRouter,
            wbnb
        );

        address adapterInfoBscAddr = IHedgepieInvestorBsc(investor)
            .adapterInfo();

        // swap reward to BNB
        if(rewardAmt != 0) {
            rewardAmt = HedgepieLibraryBsc.swapforBnb(
                rewardAmt,
                address(this),
                rewardToken,
                swapRouter,
                wbnb
            );

            IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateProfitInfo(
                _tokenId,
                rewardAmt,
                true
            );

            amountOut += rewardAmt;
        }

        // Update adapterInfo contract
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoBsc(adapterInfoBscAddr).updateParticipantInfo(
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
                        IYBNFT(IHedgepieInvestorBsc(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorBsc(investor).treasury())
                    .call{value: rewardAmt}("");
                require(success, "Failed to send bnb to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - rewardAmt}("");
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
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        (uint256 reward, ) = HedgepieLibraryBsc.getRewards(
            _tokenId,
            address(this),
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;

        if (reward != 0 && rewardToken != address(0)) {
            amountOut += HedgepieLibraryBsc.swapforBnb(
                reward,
                address(this),
                rewardToken,
                swapRouter,
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
            require(success, "Failed to send ether to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        IHedgepieAdapterInfoBsc(IHedgepieInvestorBsc(investor).adapterInfo())
            .updateProfitInfo(_tokenId, amountOut, true);
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
            ((IFairLaunch(strategy).pendingAlpaca(pid, address(this)) * 1e12) /
                adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;

        if (tokenRewards != 0)
            reward = rewardToken == wbnb
                ? tokenRewards
                : IPancakeRouter(swapRouter).getAmountsOut(
                    tokenRewards,
                    getPaths(rewardToken, wbnb)
                )[1];
    }

    receive() external payable {}
}
