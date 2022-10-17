// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

interface IHedgepieInvestorEth {
    function ybnft() external view returns (address);

    function adapterManager() external view returns (address);
}
