// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract PancakeStakeAdapter is Ownable {
    address public stakingToken;
    address public rewardToken;
    address public strategy;
    address public investor;
    string public name;

    event InvestorSet(address indexed user, address investor);

    constructor(
        address _stakingToken,
        address _rewardToken,
        address _strategy,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        name = _name;
    }

    // ===== modifiers =====
    modifier onlyInvestor(address _caller) {
        require(_caller == investor, "Error: caller is not investor");
        _;
    }

    function getInvestCallData(uint256 _amount)
        external
        view
        onlyInvestor(msg.sender)
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("deposit(uint256)", _amount);
    }

    function getDevestCallData(uint256 _amount)
        external
        view
        onlyInvestor(msg.sender)
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("withdraw(uint256)", _amount);
    }

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
