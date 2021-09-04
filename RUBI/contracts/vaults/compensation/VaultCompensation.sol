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

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "../../library/bep20/SafeBEP20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "../../library/PausableUpgradeable.sol";
import "../../library/SafeToken.sol";

import "../../interfaces/IPriceCalculator.sol";

contract VaultCompensation is PausableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeBEP20 for IBEP20;
    using SafeMath for uint256;
    using SafeToken for address;

    /* ========== CONSTANTS ============= */

    IPriceCalculator public constant priceCalculator =
        IPriceCalculator(0xF5BF8A9249e3cc4cB684E3f23db9669323d4FB7d);

    address public constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;

    struct RewardInfo {
        address token;
        uint256 rewardPerTokenStored;
        uint256 rewardRate;
        uint256 lastUpdateTime;
    }

    struct DepositRequest {
        address to;
        uint256 amount;
    }

    struct UserStatus {
        uint256 balance;
        uint256 totalRewardsPaidInUSD;
        uint256 userTotalRewardsPaidInUSD;
        uint256[] pendingRewards;
    }

    /* ========== STATE VARIABLES ========== */

    address public stakingToken;
    address public rewardsDistribution;

    uint256 public periodFinish;
    uint256 public rewardsDuration;
    uint256 public totalRewardsPaidInUSD;

    address[] private _rewardTokens;
    mapping(address => RewardInfo) public rewards;
    mapping(address => mapping(address => uint256)) public userRewardPerToken;
    mapping(address => mapping(address => uint256))
        public userRewardPerTokenPaid;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _compensations;

    /* ========== EVENTS ========== */

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    event RewardsAdded(uint256 value);
    event RewardsPaid(address indexed user, address token, uint256 amount);
    event Recovered(address token, uint256 amount);

    receive() external payable {}

    /* ========== MODIFIERS ========== */

    modifier onlyRewardsDistribution() {
        require(msg.sender == rewardsDistribution, "onlyRewardsDistribution");
        _;
    }

    modifier updateRewards(address account) {
        for (uint256 i = 0; i < _rewardTokens.length; i++) {
            RewardInfo storage rewardInfo = rewards[_rewardTokens[i]];
            rewardInfo.rewardPerTokenStored = rewardPerToken(rewardInfo.token);
            rewardInfo.lastUpdateTime = lastTimeRewardApplicable();

            if (account != address(0)) {
                userRewardPerToken[account][rewardInfo.token] = earned(
                    account,
                    rewardInfo.token
                );
                userRewardPerTokenPaid[account][rewardInfo.token] = rewardInfo
                    .rewardPerTokenStored;
            }
        }
        _;
    }

    /* ========== INITIALIZER ========== */

    function initialize() external initializer {
        __PausableUpgradeable_init();
        __ReentrancyGuard_init();

        rewardsDuration = 1 days;
    }

    /* ========== VIEW FUNCTIONS ========== */

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function statusOf(address account) public view returns (UserStatus memory) {
        UserStatus memory status;
        status.balance = _balances[account];
        status.totalRewardsPaidInUSD = totalRewardsPaidInUSD;
        status.userTotalRewardsPaidInUSD = _compensations[account];
        status.pendingRewards = new uint256[](_rewardTokens.length);
        for (uint256 i = 0; i < _rewardTokens.length; i++) {
            status.pendingRewards[i] = earned(account, _rewardTokens[i]);
        }
        return status;
    }

    function earned(address account, address token)
        public
        view
        returns (uint256)
    {
        return
            _balances[account]
                .mul(
                    rewardPerToken(token).sub(
                        userRewardPerTokenPaid[account][token]
                    )
                )
                .div(1e18)
                .add(userRewardPerToken[account][token]);
    }

    function rewardTokens() public view returns (address[] memory) {
        return _rewardTokens;
    }

    function rewardPerToken(address token) public view returns (uint256) {
        if (totalSupply() == 0) return rewards[token].rewardPerTokenStored;
        return
            rewards[token].rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(rewards[token].lastUpdateTime)
                    .mul(rewards[token].rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setStakingToken(address _stakingToken) public onlyOwner {
        require(
            stakingToken == address(0),
            "VaultComp: stakingToken set already"
        );
        stakingToken = _stakingToken;
    }

    function addRewardsToken(address _rewardsToken) public onlyOwner {
        require(
            _rewardsToken != address(0),
            "VaultComp: BNB uses WBNB address"
        );
        require(
            rewards[_rewardsToken].token == address(0),
            "VaultComp: duplicated rewards token"
        );
        rewards[_rewardsToken] = RewardInfo(_rewardsToken, 0, 0, 0);
        _rewardTokens.push(_rewardsToken);
    }

    function setRewardsDistribution(address _rewardsDistribution)
        public
        onlyOwner
    {
        rewardsDistribution = _rewardsDistribution;
    }

    function depositOnBehalf(uint256 _amount, address _to) external onlyOwner {
        _deposit(_amount, _to);
    }

    function _deposit(uint256 _amount, address _to) private updateRewards(_to) {
        require(
            stakingToken != address(0),
            "VaultComp: staking token must be set"
        );
        IBEP20(stakingToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
        _totalSupply = _totalSupply.add(_amount);
        _balances[_to] = _balances[_to].add(_amount);
        emit Deposited(_to, _amount);
    }

    function depositOnBehalfBulk(DepositRequest[] memory request)
        external
        onlyOwner
    {
        uint256 sum;
        for (uint256 i = 0; i < request.length; i++) {
            sum += request[i].amount;
        }

        _totalSupply = _totalSupply.add(sum);
        IBEP20(stakingToken).safeTransferFrom(msg.sender, address(this), sum);

        for (uint256 i = 0; i < request.length; i++) {
            address to = request[i].to;
            uint256 amount = request[i].amount;
            _balances[to] = _balances[to].add(amount);
            emit Deposited(to, amount);
        }
    }

    function updateCompensationsBulk(
        address[] memory _accounts,
        uint256[] memory _values
    ) external onlyOwner {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compensations[_accounts[i]] = _compensations[_accounts[i]].add(
                _values[i]
            );
        }
    }

    /* ========== RESTRICTED FUNCTIONS - COMPENSATION ========== */

    function notifyRewardAmounts(uint256[] memory amounts)
        external
        onlyRewardsDistribution
        updateRewards(address(0))
    {
        uint256 accRewardsPaidInUSD = 0;
        for (uint256 i = 0; i < _rewardTokens.length; i++) {
            RewardInfo storage rewardInfo = rewards[_rewardTokens[i]];
            if (block.timestamp >= periodFinish) {
                rewardInfo.rewardRate = amounts[i].div(rewardsDuration);
            } else {
                uint256 remaining = periodFinish.sub(block.timestamp);
                uint256 leftover = remaining.mul(rewardInfo.rewardRate);
                rewardInfo.rewardRate = amounts[i].add(leftover).div(
                    rewardsDuration
                );
            }
            rewardInfo.lastUpdateTime = block.timestamp;

            // Ensure the provided reward amount is not more than the balance in the contract.
            // This keeps the reward rate in the right range, preventing overflows due to
            // very high values of rewardRate in the earned and rewardsPerToken functions;
            // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.

            uint256 _balance = rewardInfo.token == WBNB
                ? address(this).balance
                : IBEP20(rewardInfo.token).balanceOf(address(this));
            require(
                rewardInfo.rewardRate <= _balance.div(rewardsDuration),
                "VaultComp: invalid rewards amount"
            );

            (, uint256 valueInUSD) = priceCalculator.valueOfAsset(
                rewardInfo.token,
                amounts[i]
            );
            accRewardsPaidInUSD = accRewardsPaidInUSD.add(valueInUSD);
        }

        totalRewardsPaidInUSD = totalRewardsPaidInUSD.add(accRewardsPaidInUSD);
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardsAdded(accRewardsPaidInUSD);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(
            periodFinish == 0 || block.timestamp > periodFinish,
            "VaultComp: invalid rewards duration"
        );
        rewardsDuration = _rewardsDuration;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function deposit(uint256 _amount)
        public
        notPaused
        updateRewards(msg.sender)
    {
        require(
            stakingToken != address(0),
            "VaultComp: staking token must be set"
        );
        IBEP20(stakingToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );

        _totalSupply = _totalSupply.add(_amount);
        _balances[msg.sender] = _balances[msg.sender].add(_amount);
        emit Deposited(msg.sender, _amount);
    }

    function withdraw(uint256 _amount)
        external
        notPaused
        updateRewards(msg.sender)
    {
        require(
            stakingToken != address(0),
            "VaultComp: staking token must be set"
        );

        _totalSupply = _totalSupply.sub(_amount);
        _balances[msg.sender] = _balances[msg.sender].sub(_amount);
        IBEP20(stakingToken).safeTransfer(msg.sender, _amount);
        emit Withdrawn(msg.sender, _amount);
    }

    function getReward() public nonReentrant updateRewards(msg.sender) {
        require(
            stakingToken != address(0),
            "VaultComp: staking token must be set"
        );
        for (uint256 i = 0; i < _rewardTokens.length; i++) {
            if (msg.sender != address(0)) {
                uint256 reward = userRewardPerToken[msg.sender][
                    _rewardTokens[i]
                ];
                if (reward > 0) {
                    userRewardPerToken[msg.sender][_rewardTokens[i]] = 0;
                    (, uint256 valueInUSD) = priceCalculator.valueOfAsset(
                        _rewardTokens[i],
                        reward
                    );
                    _compensations[msg.sender] = _compensations[msg.sender].add(
                        valueInUSD
                    );

                    if (_rewardTokens[i] == WBNB) {
                        SafeToken.safeTransferETH(msg.sender, reward);
                    } else {
                        IBEP20(_rewardTokens[i]).safeTransfer(
                            msg.sender,
                            reward
                        );
                    }
                    emit RewardsPaid(msg.sender, _rewardTokens[i], reward);
                }
            }
        }
    }

    /* ========== SALVAGE PURPOSE ONLY ========== */

    function recoverToken(address _token, uint256 amount) external onlyOwner {
        require(
            stakingToken != address(0),
            "VaultComp: staking token must be set"
        );
        require(
            _token != address(stakingToken),
            "VaultComp: cannot recover underlying token"
        );
        IBEP20(_token).safeTransfer(owner(), amount);
        emit Recovered(_token, amount);
    }
}
