// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../strategy-venus-vault-base.sol";

contract StrategyVenusXVSVault is StrategyVenusVaultBase {
    constructor(
        address _stakingToken,
        address _rewardToken,
        address _strategist
    ) StrategyVenusVaultBase(_stakingToken, _rewardToken, _strategist, 0) {}

    function getName() external pure returns (string memory) {
        return "StrategyVenusXVSVault";
    }
}
