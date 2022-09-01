// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

abstract contract InvestorTestBase is INonfungiblePositionManager {
    
}

contract InvestorTest {
    function testFunc(INonfungiblePositionManager.MintParams memory params) external pure returns(bytes memory) {
        return abi.encodeWithSignature("mint(MintParams calldata params)", params);
    }
}