// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/Ownable.sol";
import "./interfaces/IAdapterMatic.sol";

contract HedgepieAdapterInfoEth is Ownable {
    struct AdapterInfo {
        uint256 tvl;
        uint256 participant;
        uint256 traded;
        uint256 profit;
    }

    // nftId => AdapterInfo
    mapping(uint256 => AdapterInfo) public adapterInfo;

    // AdapterInfoEth managers mapping
    mapping(address => bool) public managers;

    modifier isManager() {
        require(managers[msg.sender], "Invalid manager address");
        _;
    }

    event AdapterInfoUpdated(
        uint256 indexed tokenId,
        uint256 participant,
        uint256 traded,
        uint256 profit
    );
}
