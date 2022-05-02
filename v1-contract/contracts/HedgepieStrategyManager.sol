// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/Ownable.sol";
import "./interfaces/IStrategy.sol";

contract HedgepieStrategyManager is Ownable {
    // strategy address => status
    mapping(address => bool) public strategies;

    // investor address
    address public investor;

    event StrategyAdded(address strategy);
    event StrategyRemoveed(address strategy);

    // ===== modifiers =====
    modifier onlyActiveStratey(address _strategy) {
        require(strategies[_strategy], "Error: strategy was not listed");
        _;
    }

    modifier onlyInvestor() {
        require(msg.sender == investor, "Error: caller is not investor");
        _;
    }

    /**
     * @notice Deposit from strategy
     * @param _strategy  strategy address
     * @param _amount  deposit amount
     */
    function deposit(address _strategy, uint256 _amount)
        external
        onlyActiveStratey(_strategy)
        onlyInvestor
    {
        require(_amount > 0, "Amount can not be 0");

        IStrategy(_strategy).invest(_amount);
    }

    /**
     * @notice Withdraw from strategy
     * @param _strategy  strategy address
     * @param _amount  withdraw amount
     */
    function withdraw(address _strategy, uint256 _amount)
        external
        onlyActiveStratey(_strategy)
        onlyInvestor
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

    /**
     * @notice Set investor contract
     * @param _investor  investor address
     */
    function setInvestor(address _investor) external onlyOwner {
        require(_investor != address(0), "Invalid investor address");

        investor = _investor;
    }
}
