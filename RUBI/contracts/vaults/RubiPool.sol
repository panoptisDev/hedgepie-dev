// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";
import "../library/bep20/SafeBEP20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../library/legacy/RewardsDistributionRecipient.sol";
import "../library/legacy/Pausable.sol";
import "../interfaces/legacy/IStrategyHelper.sol";
import "../interfaces/IPancakeRouter02.sol";
import "../interfaces/legacy/IStrategyLegacy.sol";

// interface IPresale {
//     function totalBalance() view external returns(uint);
//     function flipToken() view external returns(address);
// }

contract RubiPool is
    IStrategyLegacy,
    RewardsDistributionRecipient,
    ReentrancyGuard,
    Pausable
{
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    /* ========== STATE VARIABLES ========== */

    IBEP20 public rewardsToken; // rubi/bnb flip
    IBEP20 public immutable stakingToken; // ruby
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rewardsDuration = 90 days;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    mapping(address => bool) private _stakePermission;

    /* ========== PRESALE ============== */
    // address private constant presaleContract = 0x641414e2a04c8f8EbBf49eD47cc87dccbA42BF07;
    // address private constant deadAddress = 0x000000000000000000000000000000000000dEaD;
    // mapping(address => uint256) private _presaleBalance;
    // uint private constant timestamp2HoursAfterPresaleEnds = 1605585600 + (2 hours);
    // uint private constant timestamp90DaysAfterPresaleEnds = 1605585600 + (90 days);

    /* ========== BUNNY HELPER ========= */

    IStrategyHelper public helper =
        IStrategyHelper(0xA84c09C1a2cF4918CaEf625682B429398b97A1a0);
    IPancakeRouter02 private constant ROUTER_V1_DEPRECATED =
        IPancakeRouter02(0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F);

    /* ========== CONSTRUCTOR ========== */

    constructor(address _stakingToken) {
        stakingToken = IBEP20(_stakingToken);
        rewardsDistribution = msg.sender;

        _stakePermission[msg.sender] = true;
        // _stakePermission[presaleContract] = true;

        IBEP20(_stakingToken).safeApprove(
            address(ROUTER_V1_DEPRECATED),
            uint256(1)
        );
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view returns (uint256) {
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

    // function presaleBalanceOf(address account) external view returns(uint256) {
    //     return _presaleBalance[account];
    // }

    function principalOf(address account)
        external
        view
        override
        returns (uint256)
    {
        return _balances[account];
    }

    function withdrawableBalanceOf(address account)
        public
        view
        override
        returns (uint256)
    {
        // if (block.timestamp > timestamp90DaysAfterPresaleEnds) {
        //     // unlock all presale rubi after 90 days of presale
        return _balances[account];
        // } else if (block.timestamp < timestamp2HoursAfterPresaleEnds) {
        //     return _balances[account].sub(_presaleBalance[account]);
        // } else {
        //     uint soldInPresale = IPresale(presaleContract).totalBalance().div(2).mul(3); // mint 150% of presale for making flip token
        //     uint rubiSupply = stakingToken.totalSupply().sub(stakingToken.balanceOf(deadAddress));
        //     if (soldInPresale >= rubiSupply) {
        //         return _balances[account].sub(_presaleBalance[account]);
        //     }
        //     uint rubiNewMint = rubiSupply.sub(soldInPresale);
        //     if (rubiNewMint >= soldInPresale) {
        //         return _balances[account];
        //     }

        //     uint lockedRatio = (soldInPresale.sub(rubiNewMint)).mul(1e18).div(soldInPresale);
        //     uint lockedBalance = _presaleBalance[account].mul(lockedRatio).div(1e18);
        //     return _balances[account].sub(lockedBalance);
        // }
    }

    function profitOf(address account)
        public
        view
        override
        returns (
            uint256 _usd,
            uint256 _rubi,
            uint256 _bnb
        )
    {
        _usd = 0;
        _rubi = 0;
        _bnb = helper.tvlInBNB(address(rewardsToken), earned(account));
    }

    function tvl() public view override returns (uint256) {
        uint256 price = helper.tokenPriceInBNB(address(stakingToken));
        return _totalSupply.mul(price).div(1e18);
    }

    function apy()
        public
        view
        override
        returns (
            uint256 _usd,
            uint256 _rubi,
            uint256 _bnb
        )
    {
        uint256 tokenDecimals = 1e18;
        uint256 __totalSupply = _totalSupply;
        if (__totalSupply == 0) {
            __totalSupply = tokenDecimals;
        }

        uint256 rewardPerTokenPerSecond = rewardRate.mul(tokenDecimals).div(
            __totalSupply
        );
        uint256 rubiPrice = helper.tokenPriceInBNB(address(stakingToken));
        uint256 flipPrice = helper.tvlInBNB(address(rewardsToken), 1e18);

        _usd = 0;
        _rubi = 0;
        _bnb = rewardPerTokenPerSecond.mul(365 days).mul(flipPrice).div(
            rubiPrice
        );
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

    function earned(address account) public view returns (uint256) {
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
    function _deposit(uint256 amount, address _to)
        private
        nonReentrant
        notPaused
        updateReward(_to)
    {
        require(amount > 0, "amount");
        _totalSupply = _totalSupply.add(amount);
        _balances[_to] = _balances[_to].add(amount);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(_to, amount);
    }

    function deposit(uint256 amount) public override {
        _deposit(amount, msg.sender);
    }

    function depositAll() external override {
        deposit(stakingToken.balanceOf(msg.sender));
    }

    function withdraw(uint256 amount)
        public
        override
        nonReentrant
        updateReward(msg.sender)
    {
        require(amount > 0, "amount");
        require(amount <= withdrawableBalanceOf(msg.sender), "locked");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
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
            reward = _flipToWBNB(reward);
            IBEP20(ROUTER_V1_DEPRECATED.WETH()).safeTransfer(
                msg.sender,
                reward
            );
            emit RewardPaid(msg.sender, reward);
        }
    }

    function _flipToWBNB(uint256 amount) private returns (uint256 reward) {
        address wbnb = ROUTER_V1_DEPRECATED.WETH();
        (uint256 rewardRubi, ) = ROUTER_V1_DEPRECATED.removeLiquidity(
            address(stakingToken),
            wbnb,
            amount,
            0,
            0,
            address(this),
            block.timestamp
        );
        address[] memory path = new address[](2);
        path[0] = address(stakingToken);
        path[1] = wbnb;
        ROUTER_V1_DEPRECATED.swapExactTokensForTokens(
            rewardRubi,
            0,
            path,
            address(this),
            block.timestamp
        );

        reward = IBEP20(wbnb).balanceOf(address(this));
    }

    function harvest() external override {}

    function info(address account)
        external
        view
        override
        returns (UserInfo memory)
    {
        UserInfo memory userInfo;

        userInfo.balance = _balances[account];
        userInfo.principal = _balances[account];
        userInfo.available = withdrawableBalanceOf(account);

        Profit memory profit;
        (uint256 usd, uint256 rubi, uint256 bnb) = profitOf(account);
        profit.usd = usd;
        profit.bnb = bnb;
        profit.rubi = rubi;
        userInfo.profit = profit;

        userInfo.poolTVL = tvl();

        APY memory poolAPY;
        (usd, rubi, bnb) = apy();
        poolAPY.usd = usd;
        poolAPY.rubi = rubi;
        poolAPY.bnb = bnb;
        userInfo.poolAPY = poolAPY;

        return userInfo;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */
    function setRewardsToken(address _rewardsToken) external onlyOwner {
        require(
            address(rewardsToken) == address(0),
            "set rewards token already"
        );

        rewardsToken = IBEP20(_rewardsToken);
        IBEP20(_rewardsToken).safeApprove(
            address(ROUTER_V1_DEPRECATED),
            uint256(1)
        );
    }

    function setHelper(IStrategyHelper _helper) external onlyOwner {
        require(address(_helper) != address(0), "zero address");
        helper = _helper;
    }

    function setStakePermission(address _address, bool permission)
        external
        onlyOwner
    {
        _stakePermission[_address] = permission;
    }

    function stakeTo(uint256 amount, address _to) external canStakeTo {
        _deposit(amount, _to);
        // if (msg.sender == presaleContract) {
        //     _presaleBalance[_to] = _presaleBalance[_to].add(amount);
        // }
    }

    function notifyRewardAmount(uint256 reward)
        external
        override
        onlyRewardsDistribution
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
        uint256 _balance = rewardsToken.balanceOf(address(this));
        require(rewardRate <= _balance.div(rewardsDuration), "reward");

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(reward);
    }

    function recoverBEP20(address tokenAddress, uint256 tokenAmount)
        external
        onlyOwner
    {
        require(
            tokenAddress != address(stakingToken) &&
                tokenAddress != address(rewardsToken),
            "tokenAddress"
        );
        IBEP20(tokenAddress).safeTransfer(owner(), tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(periodFinish == 0 || block.timestamp > periodFinish, "period");
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

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

    modifier canStakeTo() {
        require(_stakePermission[msg.sender], "auth");
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
}
