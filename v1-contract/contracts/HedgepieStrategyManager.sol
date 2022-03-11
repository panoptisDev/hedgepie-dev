// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/Ownable.sol";
import "./interfaces/IStrategy.sol";

contract HedgepieStrategyManager is Ownable {
    // strategy address => status
    mapping(address => bool) public strategies;

    event StrategyAdded(address strategy);
    event StrategyRemoveed(address strategy);

    // ===== modifiers =====
    modifier onlyActiveStratey(address _strategy) {
        require(strategies[_strategy], "Error: strategy was not listed");
        _;
    }

    function deposit(address _strategy, uint256 _amount)
        external
        onlyActiveStratey(_strategy)
    {
        require(_amount > 0, "Amount can not be 0");

        IStrategy(_strategy).invest(_amount);
    }

    function withdraw(address _strategy, uint256 _amount)
        external
        onlyActiveStratey(_strategy)
    {
        require(_amount > 0, "Amount can not be 0");

        IStrategy(_strategy).withdraw(_amount);
    }

    // ===== Owner functions =====
    /**
     * @notice Add strategy
     * @param _strategy  strategy address
     */
    function addStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy address");

        strategies[_strategy] = true;

        emit StrategyAdded(_strategy);
    }

    /**
     * @notice Remove strategy
     * @param _strategy  strategy address
     */
    function removeStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy address");

        strategies[_strategy] = false;

        emit StrategyAdded(_strategy);
    }
}
