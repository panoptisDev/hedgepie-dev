// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

interface IAdapterManagerEth {
    function getAdapterStrat(address _adapter)
        external
        view
        returns (address adapterStrat);
}
