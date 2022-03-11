// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../strategy-pancake-farm-base.sol";

contract StrategyPancakeIFOPool is StrategyPancakeStakeBase {
    constructor(
        address _stakingToken,
        address _rewardToken,
        address _strategist
    )
        public
        StrategyPancakeStakeBase(_stakingToken, _rewardToken, _strategist)
    {}

    function getName() external pure returns (string memory) {
        return "StrategyPancakeIFOStake";
    }
}
