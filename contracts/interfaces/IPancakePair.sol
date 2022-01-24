// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

interface IPancakePair {
    function token0() external view returns (address);
    function token1() external view returns (address);
}