// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.4;

import "../type/BEP20.sol";

contract DemoMockBEP20 is BEP20 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) public BEP20(_name, _symbol) {
        _mint(msg.sender, _initialSupply);
    }

    function mint(address _account, uint256 _amount) external {
        _mint(_account, _amount);
    }
}
