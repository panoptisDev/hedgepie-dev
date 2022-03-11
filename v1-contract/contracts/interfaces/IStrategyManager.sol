// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

interface IStrategyManager {
    function strategies(address _strategy) external view returns (bool);

    function deposit(address _strategy, uint256 _amount) external;

    function withdraw(address _strategy, uint256 _amount) external;
}
