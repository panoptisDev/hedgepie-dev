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

import "@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/IBEP20.sol";
import "../library/bep20/SafeBEP20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../interfaces/IRubiMinterV2.sol";
import {IRubiChef} from "../interfaces/IRubiChef.sol";
import "../interfaces/IStrategy.sol";
import "./RubiToken.sol";

contract RubiChef is IRubiChef, OwnableUpgradeable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    /* ========== CONSTANTS ============= */

    RubiToken public constant RUBI =
        RubiToken(0xC9849E6fdB743d08fAeE3E34dd2D1bc69EA11a51);

    /* ========== STATE VARIABLES ========== */

    address[] private _vaultList;
    mapping(address => VaultInfo) vaults;
    mapping(address => mapping(address => UserInfo)) vaultUsers;

    IRubiMinterV2 public minter;

    uint256 public startBlock;
    uint256 public override rubyPerBlock;
    uint256 public override totalAllocPoint;

    /* ========== MODIFIERS ========== */

    modifier onlyVaults() {
        require(
            vaults[msg.sender].token != address(0),
            "RubiChef: caller is not on the vault"
        );
        _;
    }

    modifier updateRewards(address vault) {
        VaultInfo storage vaultInfo = vaults[vault];
        if (block.number > vaultInfo.lastRewardBlock) {
            uint256 tokenSupply = tokenSupplyOf(vault);
            if (tokenSupply > 0) {
                uint256 multiplier = timeMultiplier(
                    vaultInfo.lastRewardBlock,
                    block.number
                );
                uint256 rewards = multiplier
                    .mul(rubyPerBlock)
                    .mul(vaultInfo.allocPoint)
                    .div(totalAllocPoint);
                vaultInfo.accRubiPerShare = vaultInfo.accRubiPerShare.add(
                    rewards.mul(1e12).div(tokenSupply)
                );
            }
            vaultInfo.lastRewardBlock = block.number;
        }
        _;
    }

    /* ========== EVENTS ========== */

    event NotifyDeposited(
        address indexed user,
        address indexed vault,
        uint256 amount
    );
    event NotifyWithdrawn(
        address indexed user,
        address indexed vault,
        uint256 amount
    );
    event RubiRewardPaid(
        address indexed user,
        address indexed vault,
        uint256 amount
    );

    /* ========== INITIALIZER ========== */

    function initialize(uint256 _startBlock, uint256 _rubyPerBlock)
        external
        initializer
    {
        __Ownable_init();

        startBlock = _startBlock;
        rubyPerBlock = _rubyPerBlock;
    }

    /* ========== VIEWS ========== */

    function timeMultiplier(uint256 from, uint256 to)
        public
        pure
        returns (uint256)
    {
        return to.sub(from);
    }

    function tokenSupplyOf(address vault) public view returns (uint256) {
        return IStrategy(vault).totalSupply();
    }

    function vaultInfoOf(address vault)
        external
        view
        override
        returns (VaultInfo memory)
    {
        return vaults[vault];
    }

    function vaultUserInfoOf(address vault, address user)
        external
        view
        override
        returns (UserInfo memory)
    {
        return vaultUsers[vault][user];
    }

    function pendingRubi(address vault, address user)
        public
        view
        override
        returns (uint256)
    {
        UserInfo storage userInfo = vaultUsers[vault][user];
        VaultInfo storage vaultInfo = vaults[vault];

        uint256 accRubiPerShare = vaultInfo.accRubiPerShare;
        uint256 tokenSupply = tokenSupplyOf(vault);
        if (block.number > vaultInfo.lastRewardBlock && tokenSupply > 0) {
            uint256 multiplier = timeMultiplier(
                vaultInfo.lastRewardBlock,
                block.number
            );
            uint256 rubyRewards = multiplier
                .mul(rubyPerBlock)
                .mul(vaultInfo.allocPoint)
                .div(totalAllocPoint);
            accRubiPerShare = accRubiPerShare.add(
                rubyRewards.mul(1e12).div(tokenSupply)
            );
        }
        return
            userInfo.pending.add(
                userInfo.balance.mul(accRubiPerShare).div(1e12).sub(
                    userInfo.rewardPaid
                )
            );
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function addVault(
        address vault,
        address token,
        uint256 allocPoint
    ) public onlyOwner {
        require(
            vaults[vault].token == address(0),
            "RubiChef: vault is already set"
        );
        bulkUpdateRewards();

        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint.add(allocPoint);
        vaults[vault] = VaultInfo(token, allocPoint, lastRewardBlock, 0);
        _vaultList.push(vault);
    }

    function updateVault(address vault, uint256 allocPoint) public onlyOwner {
        require(
            vaults[vault].token != address(0),
            "RubiChef: vault must be set"
        );
        bulkUpdateRewards();

        uint256 lastAllocPoint = vaults[vault].allocPoint;
        if (lastAllocPoint != allocPoint) {
            totalAllocPoint = totalAllocPoint.sub(lastAllocPoint).add(
                allocPoint
            );
        }
        vaults[vault].allocPoint = allocPoint;
    }

    function setMinter(address _minter) external onlyOwner {
        require(address(minter) == address(0), "RubiChef: setMinter only once");
        minter = IRubiMinterV2(_minter);
    }

    function setRubiPerBlock(uint256 _rubyPerBlock) external onlyOwner {
        bulkUpdateRewards();
        rubyPerBlock = _rubyPerBlock;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function notifyDeposited(address user, uint256 amount)
        external
        override
        onlyVaults
        updateRewards(msg.sender)
    {
        UserInfo storage userInfo = vaultUsers[msg.sender][user];
        VaultInfo storage vaultInfo = vaults[msg.sender];

        uint256 pending = userInfo
            .balance
            .mul(vaultInfo.accRubiPerShare)
            .div(1e12)
            .sub(userInfo.rewardPaid);
        userInfo.pending = userInfo.pending.add(pending);
        userInfo.balance = userInfo.balance.add(amount);
        userInfo.rewardPaid = userInfo
            .balance
            .mul(vaultInfo.accRubiPerShare)
            .div(1e12);
        emit NotifyDeposited(user, msg.sender, amount);
    }

    function notifyWithdrawn(address user, uint256 amount)
        external
        override
        onlyVaults
        updateRewards(msg.sender)
    {
        UserInfo storage userInfo = vaultUsers[msg.sender][user];
        VaultInfo storage vaultInfo = vaults[msg.sender];

        uint256 pending = userInfo
            .balance
            .mul(vaultInfo.accRubiPerShare)
            .div(1e12)
            .sub(userInfo.rewardPaid);
        userInfo.pending = userInfo.pending.add(pending);
        userInfo.balance = userInfo.balance.sub(amount);
        userInfo.rewardPaid = userInfo
            .balance
            .mul(vaultInfo.accRubiPerShare)
            .div(1e12);
        emit NotifyWithdrawn(user, msg.sender, amount);
    }

    function safeRubiTransfer(address user)
        external
        override
        onlyVaults
        updateRewards(msg.sender)
        returns (uint256)
    {
        UserInfo storage userInfo = vaultUsers[msg.sender][user];
        VaultInfo storage vaultInfo = vaults[msg.sender];

        uint256 pending = userInfo
            .balance
            .mul(vaultInfo.accRubiPerShare)
            .div(1e12)
            .sub(userInfo.rewardPaid);
        uint256 amount = userInfo.pending.add(pending);
        userInfo.pending = 0;
        userInfo.rewardPaid = userInfo
            .balance
            .mul(vaultInfo.accRubiPerShare)
            .div(1e12);

        minter.mint(amount);
        minter.safeRubiTransfer(user, amount);
        emit RubiRewardPaid(user, msg.sender, amount);
        return amount;
    }

    function bulkUpdateRewards() public {
        for (uint256 idx = 0; idx < _vaultList.length; idx++) {
            if (
                _vaultList[idx] != address(0) &&
                vaults[_vaultList[idx]].token != address(0)
            ) {
                updateRewardsOf(_vaultList[idx]);
            }
        }
    }

    function updateRewardsOf(address vault)
        public
        override
        updateRewards(vault)
    {}

    /* ========== SALVAGE PURPOSE ONLY ========== */

    function recoverToken(address _token, uint256 amount)
        external
        virtual
        onlyOwner
    {
        require(_token != address(RUBI), "RunyChef: cannot recover RUBI token");
        IBEP20(_token).safeTransfer(owner(), amount);
    }
}
