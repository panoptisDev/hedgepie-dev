// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/strategies/IVenusStrategy.sol";

abstract contract VenusVaultAdapter is Ownable {
    address public stakingToken;
    address public rewardToken;
    address public strategy;
    address public investor;
    uint256 public poolId;
    string public name;

    event InvestorSet(address indexed user, address investor);

    constructor(
        address _stakingToken,
        address _rewardToken,
        address _strategy,
        uint256 _poolId,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        poolId = _poolId;
        name = _name;
    }

    // ===== modifiers =====
    modifier onlyInvestor(address _user) {
        require(_user == investor, "Error: caller is not investor");
        _;
    }

    function invest(uint256 _amount) external onlyInvestor(msg.sender) {
        IVenusStrategy(strategy).deposit(rewardToken, poolId, _amount);
    }

    function withdraw(uint256 _amount) external onlyInvestor(msg.sender) {
        IVenusStrategy(strategy).requestWithdrawal(
            rewardToken,
            poolId,
            _amount
        );
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
