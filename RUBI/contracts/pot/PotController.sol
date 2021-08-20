// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

/*
  ___                      _   _
 | _ )_  _ _ _  _ _ _  _  | | | |
 | _ \ || | ' \| ' \ || | |_| |_|
 |___/\_,_|_||_|_||_\_, | (_) (_)
                    |__/

*
* MIT License
* ===========
*
* Copyright (c) 2020 BunnyFinance
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
*/

import "../library/WhitelistUpgradeable.sol";
import "../library/PausableUpgradeable.sol";
import "../library/SortitionSumTreeFactory.sol";

import "../interfaces/IPotController.sol";
import "../interfaces/IRNGenerator.sol";

contract PotController is
    IPotController,
    PausableUpgradeable,
    WhitelistUpgradeable
{
    using SortitionSumTreeFactory for SortitionSumTreeFactory.SortitionSumTrees;

    /* ========== CONSTANT ========== */

    uint256 private constant MAX_TREE_LEAVES = 5;
    IRNGenerator private constant RNGenerator =
        IRNGenerator(0x2Eb45a1017e9E0793E05aaF0796298d9b871eCad);

    /* ========== STATE VARIABLES ========== */

    SortitionSumTreeFactory.SortitionSumTrees private _sortitionSumTree;
    bytes32 private _requestId; // random number

    uint256 internal _randomness;
    uint256 public potId;
    uint256 public startedAt;

    /* ========== MODIFIERS ========== */

    modifier onlyRandomGenerator() {
        require(msg.sender == address(RNGenerator), "Only random generator");
        _;
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    function createTree(bytes32 key) internal {
        _sortitionSumTree.createTree(key, MAX_TREE_LEAVES);
    }

    function getWeight(bytes32 key, bytes32 _ID)
        internal
        view
        returns (uint256)
    {
        return _sortitionSumTree.stakeOf(key, _ID);
    }

    function setWeight(
        bytes32 key,
        uint256 weight,
        bytes32 _ID
    ) internal {
        _sortitionSumTree.set(key, weight, _ID);
    }

    function draw(bytes32 key, uint256 randomNumber)
        internal
        returns (address)
    {
        return
            address(
                uint160(uint256(_sortitionSumTree.draw(key, randomNumber)))
            );
    }

    function getRandomNumber(uint256 weight) internal {
        _requestId = RNGenerator.getRandomNumber(potId, weight);
    }

    /* ========== CALLBACK FUNCTIONS ========== */

    function numbersDrawn(
        uint256 _potId,
        bytes32 requestId,
        uint256 randomness
    ) external override onlyRandomGenerator {
        if (_requestId == requestId && potId == _potId) {
            _randomness = randomness;
        }
    }
}
