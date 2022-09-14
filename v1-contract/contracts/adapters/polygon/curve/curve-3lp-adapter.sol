// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

interface IGauge {
    function balanceOf(address account) external view returns (uint256);

    function claimable_reward(address addr, address token) external view returns (uint256);
}

contract Curve3LPAdaper is BaseAdapterMatic {
    uint256 public lpOrder;

    bool public underlying;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _rewardToken1  address of reward1 token
     * @param _liquidityToken  address of staking token
     * @param _router  address of router
     * @param _lpOrder  number of lp count in pool
     * @param _underlying  bool for underlying
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _liquidityToken,
        address _router,
        uint256 _lpOrder,
        bool _underlying,
        string memory _name
    ) {
        liquidityToken = _liquidityToken;
        stakingToken = _stakingToken;
        strategy = _strategy;
        router = _router;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;

        lpOrder = _lpOrder;

        underlying = _underlying;

        name = _name;

        isReward = true;
    }
    
    /**
     * @notice Get invest calldata
     * @param _amount  amount of invest
     */
    function getInvestCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("deposit(uint256)", _amount);
    }

    /**
     * @notice Get devest calldata
     * @param _amount  amount of devest
     */
    function getDevestCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("withdraw(uint256)", _amount);
    }

    function getAddLiqCallData(uint256 _amount)
        external
        view
        returns(
            address to,
            uint256 value,
            bytes memory data
        ) 
    {
        to = router;
        value = 0;

        uint256[3] memory amounts;
        amounts[lpOrder] = _amount;

        data = underlying ?
            abi.encodeWithSignature(
                "add_liquidity(uint256[3],uint256,bool)",
                amounts,
                0,
                true
            ) : 
            abi.encodeWithSignature(
                "add_liquidity(uint256[3],uint256)",
                amounts,
                0
            );
    }

    function getRemoveLiqCallData(uint256 _amount)
        external
        view
        returns(
            address to,
            uint256 value,
            bytes memory data
        ) 
    {
        to = router;
        value = 0;

        data = underlying ? 
            abi.encodeWithSignature(
                "remove_liquidity_one_coin(uint256,int128,uint256,bool)",
                _amount,
                lpOrder,
                0,
                true
            ) : 
            abi.encodeWithSignature(
                "remove_liquidity_one_coin(uint256,int128,uint256)",
                _amount,
                lpOrder,
                0
            );
    }

    /**
     * @notice Get reward calldata
     */
    function getRewardCallData()
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("claim_rewards(address)", investor);
    }

    function pendingReward() external view override returns (uint256 reward) {
        reward = IGauge(strategy).claimable_reward(investor, rewardToken);
    }

    function pendingReward1() external view returns (uint256 reward) {
        reward = IGauge(strategy).claimable_reward(investor, rewardToken1);
    }

    function pendingShares() external view override returns (uint256 shares) {
        shares = IGauge(strategy).balanceOf(investor);
    }
}
