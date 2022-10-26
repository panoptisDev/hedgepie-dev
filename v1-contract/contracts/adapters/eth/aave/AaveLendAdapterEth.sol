// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

import "hardhat/console.sol";

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

contract AaveLendAdapterEth is BaseAdapterEth {
    uint256 public lastStakedAmt;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _swapRouter swapRouter for swapping tokens
     * @param _name  adatper name
     * @param _weth  weth address
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _swapRouter,
        string memory _name,
        address _weth
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        swapRouter = _swapRouter;
        name = _name;
        weth = _weth;

        isReward = true;
    }

    /**
     * @notice Deposit with ETH
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     * @param _amountIn ETH amount
     */
    function deposit(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) external payable override returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = HedgepieLibraryEth.swapOnRouter(
            address(this),
            _amountIn,
            stakingToken,
            swapRouter,
            weth
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

        amountOut = HedgepieLibraryEth.swapforEth(
            address(this),
            amountOut,
            stakingToken,
            swapRouter,
            weth
        );

        (uint256 reward, ) = HedgepieLibraryEth.getRewards(
            address(this),
            _tokenId,
            _account
        );

        uint256 rewardETH;
        if (reward != 0) {
            uint256 withdrawAmt = IBEP20(stakingToken).balanceOf(address(this));
            IBEP20(rewardToken).approve(strategy, reward);
            IStrategy(strategy).withdraw(stakingToken, reward, address(this));
            withdrawAmt =
                IBEP20(stakingToken).balanceOf(address(this)) -
                withdrawAmt;
            require(withdrawAmt == reward, "Error: Getting rewards failed");

            rewardETH = HedgepieLibraryEth.swapforEth(
                address(this),
                reward,
                stakingToken,
                swapRouter,
                weth
            );
        }

        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        amountOut += rewardETH;
        if (rewardETH != 0) {
            IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                rewardETH,
                true
            );
        }

        // Update adapterInfo contract
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

        adapterInfo.totalStaked -= userInfo.amount;
        lastStakedAmt -= userInfo.amount;
        userInfo.amount = 0;
        userInfo.invested = 0;
        userInfo.userShares = 0;

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

    /**
     * @notice Claim the pending reward
     * @param _tokenId YBNFT token id
     * @param _account user wallet address
     */
    function claim(uint256 _tokenId, address _account)
        external
        payable
        override
        returns (uint256)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        (uint256 reward, ) = HedgepieLibraryEth.getRewards(
            address(this),
            _tokenId,
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;

        uint256 amountOut;
        if (reward != 0 && rewardToken != address(0)) {
            uint256 withdrawAmt = IBEP20(stakingToken).balanceOf(address(this));
            IBEP20(rewardToken).approve(strategy, reward);
            IStrategy(strategy).withdraw(stakingToken, reward, address(this));
            withdrawAmt =
                IBEP20(stakingToken).balanceOf(address(this)) -
                withdrawAmt;
            require(withdrawAmt == reward, "Error: Getting rewards failed");

            amountOut += HedgepieLibraryEth.swapforEth(
                address(this),
                reward,
                stakingToken,
                swapRouter,
                weth
            );
            lastStakedAmt -= reward;
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

        if (IBEP20(rewardToken).balanceOf(address(this)) > lastStakedAmt)
            uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
                (((IBEP20(rewardToken).balanceOf(address(this)) -
                    lastStakedAmt) * 1e12) / adapterInfo.totalStaked);

        uint256 tokenRewards = ((updatedAccTokenPerShare -
            userInfo.userShares) * userInfo.amount) / 1e12;

        if (tokenRewards != 0)
            reward = IPancakeRouter(swapRouter).getAmountsOut(
                tokenRewards,
                getPaths(stakingToken, weth)
            )[1];
    }

    receive() external payable {}
}
