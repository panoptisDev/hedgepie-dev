// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PancakeStakeAdapter is Ownable {
    address public stakingToken;
    address public rewardToken;
    address public strategy;
    string public name;

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

    function getInvestCallData(uint256 _amount)
        external
        view
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
}
