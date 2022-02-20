// SPDX-License-Identifier: None
pragma solidity ^0.8.4;

interface IYBNFT {
    struct Strategy {
        uint256 percent;
        address swapToken;
        address stakeAddress;
    }

    function getNftStrategy(uint256) external returns (Strategy[] memory);
}
