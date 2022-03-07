// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

interface IVenusStrategy {
    function deposit(
        address _rewardToken,
        uint256 _poolId,
        uint256 _amount
    ) external;

    function requestWithdrawal(
        address _rewardToken,
        uint256 _poolId,
        uint256 _amount
    ) external;
}
