// SPDX-License-Identifier: None
pragma solidity ^0.8.4;

interface IHedgepieInvestor {
    function deposit(
        address,
        address,
        uint256,
        address,
        uint256
    ) external;

    function withdraw(
        address,
        address,
        uint256,
        address,
        uint256
    ) external;

    function withdrawAll(
        address,
        address,
        uint256,
        address
    ) external;
}
