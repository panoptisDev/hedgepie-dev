// SPDX-License-Identifier: None
pragma solidity ^0.8.4;

interface IYBNFT {
    struct Strategy {
        uint256 percent;
        address swapToken;
        address strategyAddress;
    }

    function getStrategies(uint256) external returns (Strategy[] memory);

    function exists(uint256) external returns (bool);
}
