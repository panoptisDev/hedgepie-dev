// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

interface IStrategy {
    function stake(uint256 amount) external;

    function unstake(uint256 amount) external;
}
