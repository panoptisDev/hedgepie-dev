// SPDX-License-Identifier: None
pragma solidity ^0.8.0;

interface IRNG{
    function seed(address) external;
    function getRNG(address) external returns(uint);
}