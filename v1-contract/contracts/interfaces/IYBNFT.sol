// SPDX-License-Identifier: None
pragma solidity ^0.8.4;

interface IYBNFT {
    struct Adapter {
        uint256 allocation;
        address token;
        address addr;
    }

    function getAdapterInfo(uint256 nftId) external returns (Adapter[] memory);

    function exists(uint256) external returns (bool);
}
