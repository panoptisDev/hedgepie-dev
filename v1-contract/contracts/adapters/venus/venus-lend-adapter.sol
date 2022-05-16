// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interface/VBep20Interface.sol";

contract VenusLendAdapter is Ownable {
    // strategy token
    address public strategy;

    // investor address
    address public investor;

    event InvestorSet(address indexed user, address investor);

    constructor(address strategy_, address investor_) public {
        require(investor_ != address(0), "Error: Invalid investor address");
        require(
            VBep20Interface(strategy_).isVToken(),
            "Error: Invalid vToken address"
        );
        require(
            VBep20Interface(strategy_).underlying() != address(0),
            "Error: Invalid underlying address"
        );

        investor = investor_;
        strategy = strategy_;
    }

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
        data = abi.encodeWithSignature("mint(uint256)", _amount);
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
        data = abi.encodeWithSignature("redeem(uint256)", _amount);
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
