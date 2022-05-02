// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;
pragma abicoder v2;

import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "./libraries/Ownable.sol";
import "./interfaces/IBEP20.sol";

contract HedgepieMasterChef is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
    }

    // Info of each pool.
    struct PoolInfo {
        IBEP20 lpToken; // Address of LP token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. HPIEs to distribute per block.
        uint256 lastRewardBlock; // Last block number that HPIEs distribution occurs.
        uint256 accHpiePerShare; // Accumulated HPIEs per share, times 1e12. See below.
        uint256 totalShares; // Balance of total staked amount in the pool
    }

    // The REWARD TOKEN
    IBEP20 public rewardToken;

    // The REWARD HOLDER
    address public rewardHolder;

    // HPIE tokens created per block.
    uint256 public rewardPerBlock;

    // Bonus muliplier for early hpie makers.
    uint256 public BONUS_MULTIPLIER = 100;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    /**
     * @notice Constructor. Set reward token, reward emission rate and create a new pool with the params
     * @param _lp  address of token of first pool
     * @param _rewardToken  address of reward token
     * @param _rewardPerBlock  reward emission rate
     */
    constructor(
        IBEP20 _lp,
        IBEP20 _rewardToken,
        uint256 _rewardPerBlock,
        address _rewardHolder
    ) {
        require(address(_lp) != address(0), "Zero address: lpToken");
        require(
            address(_rewardToken) != address(0),
            "Zero address: rewardToken"
        );
        require(_rewardHolder != address(0), "Zero address: rewardHolder");

        rewardToken = _rewardToken;
        rewardPerBlock = _rewardPerBlock;

        // staking pool
        poolInfo.push(
            PoolInfo({
                lpToken: _lp,
                allocPoint: 1000,
                lastRewardBlock: block.number,
                accHpiePerShare: 0,
                totalShares: 0
            })
        );

        totalAllocPoint = 1000;
        rewardHolder = _rewardHolder;
    }

    /**
     * @notice Return a length of pools
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /**
     * @notice Return reward multiplier over the given _from to _to block.
     * @param _from  from block number
     * @param _to  to block number
     */
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        return _to.sub(_from).mul(BONUS_MULTIPLIER).div(100);
    }

    /**
     * @notice View function to see pending Reward on frontend.
     * @param _pid  pool id
     * @param _user  user address
     */
    function pendingReward(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accHpiePerShare = pool.accHpiePerShare;
        uint256 lpSupply = pool.totalShares;
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 hpieReward = multiplier
                .mul(rewardPerBlock)
                .mul(pool.allocPoint)
                .div(totalAllocPoint);
            accHpiePerShare = accHpiePerShare.add(
                hpieReward.mul(1e12).div(lpSupply)
            );
        }
        return user.amount.mul(accHpiePerShare).div(1e12).sub(user.rewardDebt);
    }

    /**
     * @notice Add a new lp to the pool. Can only be called by the owner.
     * XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
     * @param _allocPoint  reward allocation point
     * @param _lpToken  token address
     */
    function add(uint256 _allocPoint, IBEP20 _lpToken) public onlyOwner {
        require(address(_lpToken) != address(0), "Lp token: Zero address");
        for (uint256 i = 0; i < poolInfo.length; i++) {
            if (address(poolInfo[i].lpToken) == address(_lpToken))
                revert("Pool duplicated");
        }

        massUpdatePools();
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: block.number,
                accHpiePerShare: 0,
                totalShares: 0
            })
        );
    }

    /**
     * @notice Update the given pool's HPIE allocation point. Can only be called by the owner.
     * @param _pid  pool id
     * @param _allocPoint  reward allocation point
     */
    function set(uint256 _pid, uint256 _allocPoint) public onlyOwner {
        massUpdatePools();
        uint256 prevAllocPoint = poolInfo[_pid].allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
        if (prevAllocPoint != _allocPoint) {
            totalAllocPoint = totalAllocPoint.sub(prevAllocPoint).add(
                _allocPoint
            );
        }
    }

    /**
     * @notice Update multiplier. Can only be called by the owner.
     * @param _multiplierNumber  _multiplier value
     */
    function updateMultiplier(uint256 _multiplierNumber) public onlyOwner {
        require(_multiplierNumber >= 100, "Invalid multipler number");
        BONUS_MULTIPLIER = _multiplierNumber;
    }

    /**
     * @notice Update reward variables of the given pool to be up-to-date.
     * @param _pid  pool id
     */
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.totalShares;
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 hpieReward = multiplier
            .mul(rewardPerBlock)
            .mul(pool.allocPoint)
            .div(totalAllocPoint);
        pool.accHpiePerShare = pool.accHpiePerShare.add(
            hpieReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;
    }

    /**
     * @notice Update reward variables for all pools
     */
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    /**
     * @notice Deposit tokens
     * @param _pid  pool id
     * @param _amount  token amount
     */
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = user
                .amount
                .mul(pool.accHpiePerShare)
                .div(1e12)
                .sub(user.rewardDebt);
            if (pending > 0) {
                rewardToken.safeTransferFrom(
                    rewardHolder,
                    address(msg.sender),
                    pending
                );
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                _amount
            );
            pool.totalShares += _amount;
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accHpiePerShare).div(1e12);

        emit Deposit(msg.sender, _pid, _amount);
    }

    /**
     * @notice Withdraw tokens
     * @param _pid  pool id
     * @param _amount  token amount
     */
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(user.amount >= _amount, "withdraw: not good");

        updatePool(_pid);

        uint256 pending = user.amount.mul(pool.accHpiePerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0) {
            rewardToken.safeTransferFrom(
                rewardHolder,
                address(msg.sender),
                pending
            );
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
            pool.totalShares -= _amount;
        }
        user.rewardDebt = user.amount.mul(pool.accHpiePerShare).div(1e12);

        emit Withdraw(msg.sender, _pid, _amount);
    }

    /**
     * @notice Withdraw without caring about rewards. EMERGENCY ONLY.
     * @param _pid  pool id
     */
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        pool.totalShares -= user.amount;
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);

        user.amount = 0;
        user.rewardDebt = 0;
    }
}
