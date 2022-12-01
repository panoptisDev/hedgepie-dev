// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

interface IStrategy {
    function deposit(uint256) external;

    function withdraw(uint256) external;

    function getReward() external;

    function earned(address _user) external view returns (uint256);
}

interface IJar {
    function deposit(uint256) external;

    function withdraw(uint256) external;
}

contract PickleSushiGaugeAdapter is BaseAdapterEth {
    address public jar;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _jar  address of jar
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _rewardToken1  address of reward token1
     * @param _router address of router
     * @param _weth  weth address
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _jar,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _router,
        address _weth,
        string memory _name
    ) {
        jar = _jar;
        weth = _weth;
        strategy = _strategy;
        router = _router;
        swapRouter = _router;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;
        stakingToken = _stakingToken;
        name = _name;
    }

    /**
     * @notice Get reward from gauge
     * @param _tokenId  tokenId
     */
    function _getReward(uint256 _tokenId) internal {
        uint256 rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this));
        uint256 rewardAmt1 = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this))
            : 0;

        IStrategy(strategy).getReward();

        unchecked {
            rewardAmt0 =
                IBEP20(rewardToken).balanceOf(address(this)) -
                rewardAmt0;
            rewardAmt1 = rewardToken1 != address(0)
                ? IBEP20(rewardToken1).balanceOf(address(this)) - rewardAmt1
                : 0;

            AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
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
        }
    }

    /**
     * @notice Deposit to PickleSushiGauge adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of eth
     */
    function deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256 amountOut) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");

        // get sushi LP
        uint256 lpOut = HedgepieLibraryEth.getLP(
            IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
            weth,
            _amountIn
        );

        // deposit to Jar
        amountOut = IBEP20(jar).balanceOf(address(this));
        IBEP20(stakingToken).approve(jar, lpOut);
        IJar(jar).deposit(lpOut);
        unchecked {
            amountOut = IBEP20(jar).balanceOf(address(this)) - amountOut;
        }

        uint256 rewardAmt0 = IBEP20(rewardToken).balanceOf(address(this));
        uint256 rewardAmt1 = rewardToken1 != address(0)
            ? IBEP20(rewardToken1).balanceOf(address(this))
            : 0;

        IBEP20(jar).approve(strategy, amountOut);
        IStrategy(strategy).deposit(amountOut);

        unchecked {
            rewardAmt0 =
                IBEP20(rewardToken).balanceOf(address(this)) -
                rewardAmt0;
            rewardAmt1 = rewardToken1 != address(0)
                ? IBEP20(rewardToken1).balanceOf(address(this)) - rewardAmt1
                : 0;
        }

        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        unchecked {
            // update adapter info
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

            // update user info
            userInfo.amount += amountOut;
            userInfo.invested += _amountIn;
            if (userInfo.amount == 0) {
                userInfo.userShares = adapterInfo.accTokenPerShare;
                userInfo.userShares1 = adapterInfo.accTokenPerShare1;
            }
        }

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
    }

    /**
     * @notice Withdraw to PickleSushiGauge adapter
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
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        UserAdapterInfo memory userInfo = userAdapterInfos[_account][_tokenId];

        // withdraw from MasterChef
        amountOut = IBEP20(jar).balanceOf(address(this));

        _getReward(_tokenId);
        IStrategy(strategy).withdraw(userInfo.amount);

        unchecked {
            amountOut = IBEP20(jar).balanceOf(address(this)) - amountOut;
        }

        // withdraw from Jar
        uint256 lpAmount = IBEP20(stakingToken).balanceOf(address(this));
        IJar(jar).withdraw(amountOut);
        unchecked {
            lpAmount = IBEP20(stakingToken).balanceOf(address(this)) - lpAmount;
        }

        amountOut = HedgepieLibraryEth.withdrawLP(
            IYBNFT.Adapter(0, stakingToken, address(this), 0, 0),
            weth,
            lpAmount
        );

        uint256[3] memory rewards;
        (rewards[0], rewards[1]) = HedgepieLibraryEth.getRewards(
            _tokenId,
            address(this),
            _account
        );

        if (rewards[0] != 0) {
            rewards[2] = HedgepieLibraryEth.swapforEth(
                rewards[0],
                address(this),
                rewardToken,
                swapRouter,
                weth
            );
        }

        if (rewards[1] != 0) {
            rewards[2] += HedgepieLibraryEth.swapforEth(
                rewards[1],
                address(this),
                rewardToken1,
                swapRouter,
                weth
            );
        }

        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        amountOut += rewards[2];
        if (rewards[2] != 0) {
            IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateProfitInfo(
                _tokenId,
                rewards[2],
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

        unchecked {
            adapterInfo.totalStaked -= userInfo.amount;
        }

        delete userAdapterInfos[_account][_tokenId];

        if (amountOut != 0) {
            bool success;
            if (rewards[2] != 0) {
                rewards[2] =
                    (rewards[2] *
                        IYBNFT(IHedgepieInvestorEth(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorEth(investor).treasury())
                    .call{value: rewards[2]}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - rewards[2]}(
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
        returns (uint256)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        _getReward(_tokenId);

        (uint256 reward, uint256 reward1) = HedgepieLibraryEth.getRewards(
            _tokenId,
            address(this),
            _account
        );

        userInfo.userShares = adapterInfos[_tokenId].accTokenPerShare;
        userInfo.userShares1 = adapterInfos[_tokenId].accTokenPerShare1;

        uint256 amountOut;
        if (reward != 0 && rewardToken != address(0)) {
            amountOut += HedgepieLibraryEth.swapforEth(
                reward,
                address(this),
                rewardToken,
                swapRouter,
                weth
            );
        }

        if (reward1 != 0 && rewardToken1 != address(0)) {
            amountOut += HedgepieLibraryEth.swapforEth(
                reward1,
                address(this),
                rewardToken1,
                swapRouter,
                weth
            );
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

        uint256 updatedAccTokenPerShare = adapterInfo.accTokenPerShare +
            ((IStrategy(strategy).earned(_account) * 1e12) /
                adapterInfo.totalStaked);

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
