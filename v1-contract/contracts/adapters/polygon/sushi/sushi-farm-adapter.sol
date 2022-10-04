// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

interface IStrategy {
    function pendingSushi(uint256 _pid, address _user)
        external
        view
        returns (uint256);
}

contract SushiSwapLPAdapter is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _rewardToken1  address of reward token
     * @param _router lp provider router address
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _router,
        string memory _name
    ) {
        pid = _pid;
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;
        strategy = _strategy;
        router = _router;
        name = _name;
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
        data = abi.encodeWithSignature(
            "deposit(uint256,uint256,address)",
            pid,
            _amount,
            investor
        );
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
        data = abi.encodeWithSignature(
            "withdrawAndHarvest(uint256,uint256,address)",
            pid,
            _amount,
            investor
        );
    }

    /**
     * @notice Get pending reward
     */
    function pendingReward() external view override returns (uint256) {
        return 0;
    }

    /**
     * @notice Get pending reward
     */
    function pendingReward1() external view returns (uint256) {
        return IStrategy(strategy).pendingSushi(pid, investor);
    }
}
