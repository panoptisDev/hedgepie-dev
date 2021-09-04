// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

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

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/IBEP20.sol";
import "../library/bep20/SafeBEP20.sol";

import "../library/SafeToken.sol";
import "../library/PausableUpgradeable.sol";
import "../library/WhitelistUpgradeable.sol";
import "../interfaces/IPancakeRouter02.sol";
import "../interfaces/IBank.sol";

contract BankBridge is IBankBridge, PausableUpgradeable, WhitelistUpgradeable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;
    using SafeToken for address;

    /* ========== CONSTANTS ============= */

    uint256 private constant RESERVE_RATIO_UNIT = 10000;
    uint256 private constant RESERVE_RATIO_LIMIT = 5000;

    address private constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address private constant ETH = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;
    IPancakeRouter02 private constant ROUTER =
        IPancakeRouter02(0x10ED43C718714eb63d5aA57B78B54704E256024E);

    /* ========== STATE VARIABLES ========== */

    address public bank;

    uint256 public reserveRatio;
    uint256 public reserved;

    /* ========== INITIALIZER ========== */

    receive() external payable {}

    function initialize() external initializer {
        __PausableUpgradeable_init();
        __WhitelistUpgradeable_init();

        reserveRatio = 1000;
    }

    /* ========== VIEW FUNCTIONS ========== */

    function balance() public view returns (uint256) {
        return IBEP20(ETH).balanceOf(address(this));
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setReserveRatio(uint256 newReserveRatio) external onlyOwner {
        require(
            newReserveRatio <= RESERVE_RATIO_LIMIT,
            "BankBridge: invalid reserve ratio"
        );
        reserveRatio = newReserveRatio;
    }

    function setBank(address payable newBank) external onlyOwner {
        require(address(bank) == address(0), "BankBridge: bank exists");
        bank = newBank;
    }

    function approveETH() external onlyOwner {
        IBEP20(ETH).approve(address(ROUTER), uint256(1));
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function realizeProfit()
        external
        payable
        override
        onlyWhitelisted
        returns (uint256 profitInETH)
    {
        if (msg.value == 0) return 0;

        uint256 reserve = msg.value.mul(reserveRatio).div(RESERVE_RATIO_UNIT);
        reserved = reserved.add(reserve);

        address[] memory path = new address[](2);
        path[0] = WBNB;
        path[1] = ETH;

        return
            ROUTER.swapExactETHForTokens{value: msg.value.sub(reserve)}(
                0,
                path,
                address(this),
                block.timestamp
            )[1];
    }

    function realizeLoss(uint256 loss)
        external
        override
        onlyWhitelisted
        returns (uint256 lossInETH)
    {
        if (loss == 0) return 0;

        address[] memory path = new address[](2);
        path[0] = ETH;
        path[1] = WBNB;

        lossInETH = ROUTER.getAmountsIn(loss, path)[0];
        uint256 ethBalance = IBEP20(ETH).balanceOf(address(this));
        if (ethBalance >= lossInETH) {
            uint256 bnbOut = ROUTER.swapTokensForExactETH(
                loss,
                lossInETH,
                path,
                address(this),
                block.timestamp
            )[1];
            SafeToken.safeTransferETH(bank, bnbOut);
            return 0;
        } else {
            if (ethBalance > 0) {
                uint256 bnbOut = ROUTER.swapExactTokensForETH(
                    ethBalance,
                    0,
                    path,
                    address(this),
                    block.timestamp
                )[1];
                SafeToken.safeTransferETH(bank, bnbOut);
            }
            lossInETH = lossInETH.sub(ethBalance);
        }
    }

    function bridgeETH(address to, uint256 amount) external onlyWhitelisted {
        if (IBEP20(ETH).allowance(address(this), address(to)) == 0) {
            IBEP20(ETH).safeApprove(address(to), uint256(1));
        }
        IBEP20(ETH).safeTransfer(to, amount);
    }
}
