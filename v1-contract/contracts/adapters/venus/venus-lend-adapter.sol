// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interface/VBep20Interface.sol";

contract VenusLendAdapter is Ownable {
    // strategy token
    address public strategy;

    constructor(address strategy_) {
        require(
            VBep20Interface(strategy_).isVToken(),
            "Error: Invalid vToken address"
        );
        require(
            VBep20Interface(strategy_).underlying() != address(0),
            "Error: Invalid underlying address"
        );

        strategy = strategy_;
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
        data = abi.encodeWithSignature("mint(uint256)", _amount);
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
        data = abi.encodeWithSignature("redeem(uint256)", _amount);
    }
}
