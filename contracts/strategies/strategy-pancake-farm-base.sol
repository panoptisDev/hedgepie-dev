// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/strategies/IPancakeswapStrategy.sol";
import "../libraries/Ownable.sol";

abstract contract StrategyPancakeStakeBase is Ownable {
    address public stakingToken;
    address public rewardToken;
    address public strategy;
    address public investor;

    event InvestorSet(address indexed user, address investor);

    constructor(
        address _stakingToken,
        address _rewardToken,
        address _strategy
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
    }

    // ===== modifiers =====
    modifier onlyInvestor(address _user) {
        require(_user == investor, "Error: caller is not investor");
        _;
    }

    function invest(uint256 _amount) external onlyInvestor(msg.sender) {
        IPancakeswapStrategy(strategy).deposit(_amount);
    }

    function withdraw(uint256 _amount) external onlyInvestor(msg.sender) {
        IPancakeswapStrategy(strategy).withdraw(_amount);
    }

    // ===== Owner functions =====
    /**
     * @notice Set investor contract
     * @param _investor  investor address
     */
    function setInvestor(address _investor) external onlyOwner {
        require(_investor != address(0), "Invalid NFT address");

        investor = _investor;

        emit InvestorSet(msg.sender, _investor);
    }
}
