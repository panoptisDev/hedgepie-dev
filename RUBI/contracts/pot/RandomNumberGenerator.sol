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

import "../library/bep20/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

import "../interfaces/IPotController.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
 * PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract RandomNumberGenerator is VRFConsumerBase, Ownable {
    /* ========== STATE VARIABLES ========== */

    bytes32 internal keyHash;
    uint256 internal fee;

    mapping(address => uint256) private _pots;
    mapping(address => bool) private _availablePot;
    mapping(bytes32 => address) private _requestIds;

    /* ========== MODIFIER ========== */

    modifier onlyPot() {
        require(
            _availablePot[msg.sender],
            "RandomNumberConsumer: is not pot contract."
        );
        _;
    }

    /* ========== EVENTS ========== */

    event RequestRandomness(
        bytes32 indexed requestId,
        bytes32 keyHash,
        uint256 seed
    );

    event RequestRandomnessFulfilled(
        bytes32 indexed requestId,
        uint256 randomness
    );

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: BSC
     * Chainlink VRF Coordinator address: 0x747973a5A2a4Ae1D3a8fDF5479f1514F65Db9C31
     * LINK token address:                0x404460C6A5EdE2D891e8297795264fDe62ADBB75
     * Key Hash: 0xc251acd21ec4fb7f31bb8868288bfdbaeb4fbfec2df3735ddbd4f7dc8d60103c
     */
    constructor(address _vrfCoordinator, address _linkToken)
        VRFConsumerBase(_vrfCoordinator, _linkToken)
    {
        keyHash = 0xc251acd21ec4fb7f31bb8868288bfdbaeb4fbfec2df3735ddbd4f7dc8d60103c;
        fee = 0.2 * 10**18; // 0.2 LINK (Varies by network)
    }

    /* ========== VIEW FUNCTIONS ========== */

    function availablePot(address pot) public view returns (bool) {
        return _availablePot[pot];
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setKeyHash(bytes32 _keyHash) external onlyOwner {
        keyHash = _keyHash;
    }

    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    function setPotAddress(address potAddress, bool activate)
        external
        onlyOwner
    {
        _availablePot[potAddress] = activate;
    }

    /* ========== MUTATE FUNCTIONS ========== */

    function getRandomNumber(uint256 potId, uint256 userProvidedSeed)
        public
        onlyPot
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        _pots[msg.sender] = potId;
        requestId = requestRandomness(keyHash, fee);
        _requestIds[requestId] = msg.sender;

        emit RequestRandomness(requestId, keyHash, userProvidedSeed);
    }

    /* ========== CALLBACK FUNCTIONS ========== */

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        address potAddress = _requestIds[requestId];
        IPotController(potAddress).numbersDrawn(
            _pots[potAddress],
            requestId,
            randomness
        );

        emit RequestRandomnessFulfilled(requestId, randomness);

        delete _requestIds[requestId];
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
