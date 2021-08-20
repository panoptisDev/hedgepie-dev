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
import "@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";
import "../library/bep20/SafeBEP20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "../library/RewardsDistributionRecipientUpgradeable.sol";
import {PoolConstant} from "../library/PoolConstant.sol";

import "../interfaces/IStrategy.sol";
import "../interfaces/IMasterChef.sol";
import "../interfaces/IRubiMinter.sol";

import "./VaultController.sol";

contract VaultFlipToCake is
    VaultController,
    IStrategy,
    RewardsDistributionRecipientUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(
        address indexed user,
        uint256 amount,
        uint256 withdrawalFee
    );
    event ProfitPaid(
        address indexed user,
        uint256 profit,
        uint256 performanceFee
    );
    event RubiPaid(
        address indexed user,
        uint256 profit,
        uint256 performanceFee
    );
    event Harvested(uint256 profit);

    /* ========== CONSTANTS ============= */

    address private constant CAKE = 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82;
    IMasterChef private constant CAKE_MASTER_CHEF =
        IMasterChef(0x73feaa1eE314F8c655E354234017bE2193C9E24E);
    PoolConstant.PoolTypes public constant override poolType =
        PoolConstant.PoolTypes.FlipToCake;

    /* ========== STATE VARIABLES ========== */

    IStrategy private _rewardsToken;

    uint256 public periodFinish;
    uint256 public rewardRate;
    uint256 public rewardsDuration;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    uint256 public override pid;
    mapping(address => uint256) private _depositedAt;

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);

    /* ========== INITIALIZER ========== */

    function initialize(uint256 _pid, address _token) external initializer {
        __VaultController_init(IBEP20(_token));
        __RewardsDistributionRecipient_init();
        __ReentrancyGuard_init();

        _stakingToken.safeApprove(address(CAKE_MASTER_CHEF), uint256(1));
        pid = _pid;

        rewardsDuration = 4 hours;

        rewardsDistribution = msg.sender;
        setMinter(0x8cB88701790F650F273c8BB2Cc4c5f439cd65219);
        setRewardsToken(0xEDfcB78e73f7bA6aD2D829bf5D462a0924da28eD);
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balance() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account)
        external
        view
        override
        returns (uint256)
    {
        return _balances[account];
    }

    function sharesOf(address account)
        external
        view
        override
        returns (uint256)
    {
        return _balances[account];
    }

    function principalOf(address account)
        external
        view
        override
        returns (uint256)
    {
        return _balances[account];
    }

    function depositedAt(address account)
        external
        view
        override
        returns (uint256)
    {
        return _depositedAt[account];
    }

    function withdrawableBalanceOf(address account)
        public
        view
        override
        returns (uint256)
    {
        return _balances[account];
    }

    function rewardsToken() external view override returns (address) {
        return address(_rewardsToken);
    }

    function priceShare() external view override returns (uint256) {
        return 1e18;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(_totalSupply)
            );
    }

    function earned(address account) public view override returns (uint256) {
        return
            _balances[account]
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    function getRewardForDuration() external view returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function deposit(uint256 amount) public override {
        _deposit(amount, msg.sender);
    }

    function depositAll() external override {
        deposit(_stakingToken.balanceOf(msg.sender));
    }

    function withdraw(uint256 amount)
        public
        override
        nonReentrant
        updateReward(msg.sender)
    {
        require(
            amount > 0,
            "VaultFlipToCake: amount must be greater than zero"
        );
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        uint256 cakeHarvested = _withdrawStakingToken(amount);
        uint256 withdrawalFee;
        if (canMint()) {
            uint256 depositTimestamp = _depositedAt[msg.sender];
            withdrawalFee = _minter.withdrawalFee(amount, depositTimestamp);
            if (withdrawalFee > 0) {
                uint256 performanceFee = withdrawalFee.div(100);
                _minter.mintForV2(
                    address(_stakingToken),
                    withdrawalFee.sub(performanceFee),
                    performanceFee,
                    msg.sender,
                    depositTimestamp
                );
                amount = amount.sub(withdrawalFee);
            }
        }

        _stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount, withdrawalFee);

        _harvest(cakeHarvested);
    }

    function withdrawAll() external override {
        uint256 _withdraw = withdrawableBalanceOf(msg.sender);
        if (_withdraw > 0) {
            withdraw(_withdraw);
        }
        getReward();
    }

    function getReward() public override nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            uint256 before = IBEP20(CAKE).balanceOf(address(this));
            _rewardsToken.withdraw(reward);
            uint256 cakeBalance = IBEP20(CAKE).balanceOf(address(this)).sub(
                before
            );
            uint256 performanceFee;

            if (canMint()) {
                performanceFee = _minter.performanceFee(cakeBalance);
                _minter.mintForV2(
                    CAKE,
                    0,
                    performanceFee,
                    msg.sender,
                    _depositedAt[msg.sender]
                );
            }

            IBEP20(CAKE).safeTransfer(
                msg.sender,
                cakeBalance.sub(performanceFee)
            );
            emit ProfitPaid(msg.sender, cakeBalance, performanceFee);
        }
    }

    function harvest() public override {
        uint256 cakeHarvested = _withdrawStakingToken(0);
        _harvest(cakeHarvested);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setMinter(address newMinter) public override onlyOwner {
        VaultController.setMinter(newMinter);
        if (newMinter != address(0)) {
            IBEP20(CAKE).safeApprove(newMinter, 0);
            IBEP20(CAKE).safeApprove(newMinter, uint256(1));
        }
    }

    function setRewardsToken(address newRewardsToken) public onlyOwner {
        require(
            address(_rewardsToken) == address(0),
            "VaultFlipToCake: rewards token already set"
        );

        _rewardsToken = IStrategy(newRewardsToken);
        IBEP20(CAKE).safeApprove(newRewardsToken, 0);
        IBEP20(CAKE).safeApprove(newRewardsToken, uint256(1));
    }

    function notifyRewardAmount(uint256 reward)
        public
        override
        onlyRewardsDistribution
    {
        _notifyRewardAmount(reward);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(
            periodFinish == 0 || block.timestamp > periodFinish,
            "VaultFlipToCake: reward duration can only be updated after the period ends"
        );
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

    /* ========== PRIVATE FUNCTIONS ========== */

    function _deposit(uint256 amount, address _to)
        private
        nonReentrant
        notPaused
        updateReward(_to)
    {
        require(
            amount > 0,
            "VaultFlipToCake: amount must be greater than zero"
        );
        _totalSupply = _totalSupply.add(amount);
        _balances[_to] = _balances[_to].add(amount);
        _depositedAt[_to] = block.timestamp;
        _stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 cakeHarvested = _depositStakingToken(amount);
        emit Deposited(_to, amount);

        _harvest(cakeHarvested);
    }

    function _depositStakingToken(uint256 amount)
        private
        returns (uint256 cakeHarvested)
    {
        uint256 before = IBEP20(CAKE).balanceOf(address(this));
        CAKE_MASTER_CHEF.deposit(pid, amount);
        cakeHarvested = IBEP20(CAKE).balanceOf(address(this)).sub(before);
    }

    function _withdrawStakingToken(uint256 amount)
        private
        returns (uint256 cakeHarvested)
    {
        uint256 before = IBEP20(CAKE).balanceOf(address(this));
        CAKE_MASTER_CHEF.withdraw(pid, amount);
        cakeHarvested = IBEP20(CAKE).balanceOf(address(this)).sub(before);
    }

    function _harvest(uint256 cakeAmount) private {
        uint256 _before = _rewardsToken.sharesOf(address(this));
        _rewardsToken.deposit(cakeAmount);
        uint256 amount = _rewardsToken.sharesOf(address(this)).sub(_before);
        if (amount > 0) {
            _notifyRewardAmount(amount);
            emit Harvested(amount);
        }
    }

    function _notifyRewardAmount(uint256 reward)
        private
        updateReward(address(0))
    {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(rewardsDuration);
        }

        // Ensure the provided reward amount is not more than the balance in the contract.
        // This keeps the reward rate in the right range, preventing overflows due to
        // very high values of rewardRate in the earned and rewardsPerToken functions;
        // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
        uint256 _balance = _rewardsToken.sharesOf(address(this));
        require(
            rewardRate <= _balance.div(rewardsDuration),
            "VaultFlipToCake: reward rate must be in the right range"
        );

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(reward);
    }

    /* ========== SALVAGE PURPOSE ONLY ========== */

    // @dev rewardToken(CAKE) must not remain balance in this contract. So dev should be able to salvage reward token transferred by mistake.
    function recoverToken(address tokenAddress, uint256 tokenAmount)
        external
        override
        onlyOwner
    {
        require(
            tokenAddress != address(_stakingToken),
            "VaultFlipToCake: cannot recover underlying token"
        );

        IBEP20(tokenAddress).safeTransfer(owner(), tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }
}
