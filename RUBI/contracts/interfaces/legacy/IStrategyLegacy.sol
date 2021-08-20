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

interface IStrategyLegacy {
    struct Profit {
        uint256 usd;
        uint256 rubi;
        uint256 bnb;
    }

    struct APY {
        uint256 usd;
        uint256 rubi;
        uint256 bnb;
    }

    struct UserInfo {
        uint256 balance;
        uint256 principal;
        uint256 available;
        Profit profit;
        uint256 poolTVL;
        APY poolAPY;
    }

    function deposit(uint256 _amount) external;

    function depositAll() external;

    function withdraw(uint256 _amount) external; // rubi STAKING POOL ONLY

    function withdrawAll() external;

    function getReward() external; // rubi STAKING POOL ONLY

    function harvest() external;

    function balance() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function principalOf(address account) external view returns (uint256);

    function withdrawableBalanceOf(address account)
        external
        view
        returns (uint256); // BUNNY STAKING POOL ONLY

    function profitOf(address account)
        external
        view
        returns (
            uint256 _usd,
            uint256 _rubi,
            uint256 _bnb
        );

    //    function earned(address account) external view returns (uint);
    function tvl() external view returns (uint256); // in USD

    function apy()
        external
        view
        returns (
            uint256 _usd,
            uint256 _rubi,
            uint256 _bnb
        );

    /* ========== Strategy Information ========== */
    //    function pid() external view returns (uint);
    //    function poolType() external view returns (PoolTypes);
    //    function isMinter() external view returns (bool, address);
    //    function getDepositedAt(address account) external view returns (uint);
    //    function getRewardsToken() external view returns (address);

    function info(address account) external view returns (UserInfo memory);
}
