// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

interface IStakingRewards {
    function pendingStargate(uint256 poolId, address account)
        external
        view
        returns (uint256);

    function balanceOf(address account) external view returns (uint256);
}

contract StargateFarmAdapter is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _router  address of reward token
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _router,
        uint256 _poolId,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        router = _router;
        strategy = _strategy;
        name = _name;
        pid = _poolId;

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
        data = abi.encodeWithSignature("stake(uint256)", _amount);
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
        data = abi.encodeWithSignature("getReward()");
    }

    function pendingReward() external view override returns (uint256 reward) {
        reward = IStakingRewards(strategy).pendingStargate(pid, msg.sender);
    }
}
