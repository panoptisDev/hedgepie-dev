// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

interface IBaseAdapterMatic {
    enum RouterType {
        None,
        Quick,
        Balancer,
        Stargate,
        UniswapV3
    }
}