// SPDX-License-Identifier: None
pragma solidity ^0.7.5;

interface IRNG{
    function getRandomNumber() external returns (bytes32);
    function randomResults(bytes32) external returns(uint256);
}