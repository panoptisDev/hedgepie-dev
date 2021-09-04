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

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "../interfaces/IBank.sol";
import "../library/SafeToken.sol";

import "./BankBridge.sol";
import "../vaults/venus/VaultVenus.sol";

contract BankBNB is IBank, WhitelistUpgradeable, ReentrancyGuardUpgradeable {
    using SafeMath for uint256;
    using SafeToken for address;

    /* ========== CONSTANTS ============= */

    address private constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address public constant TREASURY =
        0x0989091F27708Bc92ea4cA60073e03592B94C0eE;

    /* ========== STATE VARIABLES ========== */

    IBankConfig public config;
    BankBridge public bankBridge;
    VaultVenus public vaultVenus;

    uint256 public lastAccrueTime;
    uint256 public reserved;
    uint256 public totalDebt;
    uint256 public totalShares;
    mapping(address => mapping(address => uint256)) private _shares;

    /* ========== EVENTS ========== */

    event DebtAdded(
        address indexed pool,
        address indexed account,
        uint256 share
    );
    event DebtRemoved(
        address indexed pool,
        address indexed account,
        uint256 share
    );
    event DebtHandedOver(
        address indexed pool,
        address indexed from,
        address indexed to,
        uint256 share
    );

    /* ========== MODIFIERS ========== */

    modifier accrue() {
        vaultVenus.updateVenusFactors();
        if (block.timestamp > lastAccrueTime) {
            uint256 interest = pendingInterest();
            uint256 reserve = interest.mul(config.getReservePoolBps()).div(
                10000
            );
            totalDebt = totalDebt.add(interest);
            reserved = reserved.add(reserve);
            lastAccrueTime = block.timestamp;
        }
        _;
        vaultVenus.updateVenusFactors();
    }

    modifier onlyBridge() {
        require(
            msg.sender == address(bankBridge),
            "BankBNB: caller is not the bridge"
        );
        _;
    }

    receive() external payable {}

    /* ========== INITIALIZER ========== */

    function initialize() external initializer {
        __ReentrancyGuard_init();
        __WhitelistUpgradeable_init();

        lastAccrueTime = block.timestamp;
    }

    /* ========== VIEW FUNCTIONS ========== */

    function pendingInterest() public view returns (uint256) {
        if (block.timestamp <= lastAccrueTime) return 0;

        uint256 ratePerSec = config.getInterestRate(
            totalDebt,
            vaultVenus.balance()
        );
        return
            ratePerSec
                .mul(totalDebt)
                .mul(block.timestamp.sub(lastAccrueTime))
                .div(1e18);
    }

    function pendingDebtOf(address pool, address account)
        public
        view
        override
        returns (uint256)
    {
        uint256 share = sharesOf(pool, account);
        if (totalShares == 0) return share;

        return share.mul(totalDebt.add(pendingInterest())).div(totalShares);
    }

    function pendingDebtOfBridge() external view override returns (uint256) {
        return pendingDebtOf(address(this), address(bankBridge));
    }

    function sharesOf(address pool, address account)
        public
        view
        override
        returns (uint256)
    {
        return _shares[pool][account];
    }

    function shareToAmount(uint256 share)
        public
        view
        override
        returns (uint256)
    {
        if (totalShares == 0) return share;
        return share.mul(totalDebt).div(totalShares);
    }

    function amountToShare(uint256 amount)
        public
        view
        override
        returns (uint256)
    {
        if (totalShares == 0) return amount;
        return amount.mul(totalShares).div(totalDebt);
    }

    function debtToProviders() public view override returns (uint256) {
        return totalDebt.sub(reserved);
    }

    function getUtilizationInfo()
        public
        view
        override
        returns (uint256 liquidity, uint256 utilized)
    {
        return (vaultVenus.balance(), totalDebt);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function accruedDebtOf(address pool, address account)
        public
        override
        accrue
        returns (uint256)
    {
        return shareToAmount(sharesOf(pool, account));
    }

    function accruedDebtOfBridge() public override accrue returns (uint256) {
        return shareToAmount(sharesOf(address(this), address(bankBridge)));
    }

    function executeAccrue() external override {
        if (block.timestamp > lastAccrueTime) {
            uint256 interest = pendingInterest();
            uint256 reserve = interest.mul(config.getReservePoolBps()).div(
                10000
            );
            totalDebt = totalDebt.add(interest);
            reserved = reserved.add(reserve);
            lastAccrueTime = block.timestamp;
        }
    }

    /* ========== RESTRICTED FUNCTIONS - CONFIGURATION ========== */

    function setBankBridge(address payable newBridge) external onlyOwner {
        require(
            address(bankBridge) == address(0),
            "BankBNB: bridge is already set"
        );
        require(newBridge != address(0), "BankBNB: invalid bridge address");
        bankBridge = BankBridge(newBridge);
    }

    function setVaultVenus(address payable newVaultVenus) external onlyOwner {
        require(
            address(vaultVenus) == address(0),
            "BankBNB: VaultVenus is already set"
        );
        require(
            newVaultVenus != address(0) &&
                VaultVenus(newVaultVenus).stakingToken() == WBNB,
            "BankBNB: invalid VaultVenus"
        );
        vaultVenus = VaultVenus(newVaultVenus);
    }

    function updateConfig(address newConfig) external onlyOwner {
        require(newConfig != address(0), "BankBNB: invalid config address");
        config = IBankConfig(newConfig);
    }

    /* ========== RESTRICTED FUNCTIONS - BANKING ========== */

    function borrow(
        address pool,
        address account,
        uint256 amount
    ) external override accrue onlyWhitelisted returns (uint256 debtInBNB) {
        amount = Math.min(amount, vaultVenus.balance());
        amount = vaultVenus.borrow(amount);
        uint256 share = amountToShare(amount);

        _shares[pool][account] = _shares[pool][account].add(share);
        totalShares = totalShares.add(share);
        totalDebt = totalDebt.add(amount);

        SafeToken.safeTransferETH(msg.sender, amount);
        emit DebtAdded(pool, account, share);
        return amount;
    }

    //    function repayPartial(address pool, address account) public override payable accrue onlyWhitelisted {
    //        uint debt = accruedDebtOf(pool, account);
    //        uint available = Math.min(msg.value, debt);
    //        vaultVenus.repay{value : available}();
    //
    //        uint share = Math.min(amountToShare(available), _shares[pool][account]);
    //        _shares[pool][account] = _shares[pool][account].sub(share);
    //        totalShares = totalShares.sub(share);
    //        totalDebt = totalDebt.sub(available);
    //        emit DebtRemoved(pool, account, share);
    //
    //        if (totalDebt < reserved) {
    //            _decreaseReserved(TREASURY, reserved);
    //        }
    //    }

    function repayAll(address pool, address account)
        public
        payable
        override
        accrue
        onlyWhitelisted
        returns (uint256 profitInETH, uint256 lossInETH)
    {
        uint256 received = msg.value;
        uint256 bnbBefore = address(this).balance;

        uint256 debt = accruedDebtOf(pool, account);
        uint256 profit = received > debt ? received.sub(debt) : 0;
        uint256 loss = received < debt ? debt.sub(received) : 0;

        profitInETH = profit > 0
            ? bankBridge.realizeProfit{value: profit}()
            : 0;
        lossInETH = loss > 0 ? bankBridge.realizeLoss(loss) : 0;
        received = loss > 0
            ? received.add(address(this).balance).sub(bnbBefore)
            : received.sub(profit);

        uint256 available = Math.min(received, debt);
        vaultVenus.repay{value: available}();

        uint256 share = _shares[pool][account];
        if (loss > 0) {
            uint256 unpaidDebtShare = Math.min(amountToShare(loss), share);
            _shares[address(this)][address(bankBridge)] = _shares[
                address(this)
            ][address(bankBridge)].add(unpaidDebtShare);
            emit DebtHandedOver(pool, account, msg.sender, unpaidDebtShare);

            share = share.sub(unpaidDebtShare);
        }

        delete _shares[pool][account];
        totalShares = totalShares.sub(share);
        totalDebt = totalDebt.sub(available);
        emit DebtRemoved(pool, account, share);

        _cleanupDust();

        if (totalDebt < reserved) {
            _decreaseReserved(TREASURY, reserved);
        }
    }

    function repayBridge() external payable override {
        uint256 debtInBNB = accruedDebtOfBridge();
        if (debtInBNB == 0) return;
        require(msg.value >= debtInBNB, "BankBNB: not enough value");

        vaultVenus.repay{value: debtInBNB}();

        uint256 share = _shares[address(this)][address(bankBridge)];
        delete _shares[address(this)][address(bankBridge)];
        totalShares = totalShares.sub(share);
        totalDebt = totalDebt.sub(debtInBNB);
        emit DebtRemoved(address(this), address(bankBridge), share);

        _cleanupDust();

        if (totalDebt < reserved) {
            _decreaseReserved(TREASURY, reserved);
        }

        if (msg.value > debtInBNB) {
            SafeToken.safeTransferETH(msg.sender, msg.value.sub(debtInBNB));
        }
    }

    function bridgeETH(address to, uint256 amount)
        external
        override
        onlyWhitelisted
    {
        bankBridge.bridgeETH(to, amount);
    }

    /* ========== RESTRICTED FUNCTIONS - OPERATION ========== */

    function withdrawReserved(address to, uint256 amount)
        external
        onlyOwner
        accrue
        nonReentrant
    {
        require(amount <= reserved, "BankBNB: amount exceeded");
        _decreaseReserved(to, amount);
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    function _decreaseReserved(address to, uint256 amount) private {
        reserved = reserved.sub(amount);
        amount = vaultVenus.borrow(amount);
        SafeToken.safeTransferETH(to, amount);
    }

    function _cleanupDust() private {
        if (totalDebt < 1000 && totalShares < 1000) {
            totalShares = 0;
            totalDebt = 0;
        }
    }
}
