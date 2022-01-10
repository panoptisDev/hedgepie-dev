// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "./libraries/SafeBEP20.sol";
import "./libraries/SafeMath.sol";
import "./libraries/FixedPoint.sol";

contract RubiStake {
    using FixedPoint for *;
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    address public immutable RubiToken;
    uint8 public constant blockEmission = 5;
    uint public totalStake;
    mapping(address => UserStake) public userStake;
    struct UserStake {
        uint start;
        uint reward;
        uint amount;
    }

    event Stake(address indexed _staker, uint _amount);
    event Unstake(address indexed _unStaker, uint _amount);

    constructor(address _rubi) {
        require(_rubi != address(0));
        RubiToken = _rubi;
    }

    function _getReward() private view returns(uint reward_) {
        UserStake memory info = userStake[msg.sender];
        if(info.start > 0) {
            reward_ = FixedPoint.fraction( (block.number - info.start).mul(info.amount), totalStake ).decode112with18();
        }
    }

    function _checkUnstake(uint _amount) private view returns(bool) {
        UserStake memory info = userStake[msg.sender];
        return info.amount.add(_getReward()) >= _amount;
    }

    function _stake(uint _amount) private {
        UserStake memory info = userStake[msg.sender];
        userStake[msg.sender] = UserStake({
            amount: info.amount.add(_amount),
            reward: info.reward.add(_getReward()),
            start: block.number
        });

        IBEP20( RubiToken ).safeTransferFrom( msg.sender, address(this), _amount );
    }

    function _unstake(uint _amount) private {
        UserStake memory info = userStake[msg.sender];

        uint remain = 0;
        uint userReward = _getReward();
        if(userReward <= _amount) {
            remain = _amount.sub(userReward);
            userReward = 0;
        } else {
            userReward = userReward.sub(_amount);
        }

        userStake[msg.sender] = UserStake({
            amount: info.amount.sub(remain),
            reward: userReward,
            start: block.number
        });

        IBEP20( RubiToken ).safeTransfer( msg.sender, _amount );
    }

    function getStake() public view returns(UserStake memory info) {
        info = userStake[msg.sender];
        info.reward = info.reward.add(_getReward());
    }

    function stake(uint _amount) public returns(bool) {
        require(_amount > 0, "Invalid amount");

        _stake(_amount);

        emit Stake(msg.sender, _amount);
        return true;
    }

    function unstake(uint _amount) public returns(bool) {
        require(_amount > 0, "Invalid amount");
        require(_checkUnstake(_amount), "Insufficient amount");
        
        _unstake(_amount);

        emit Unstake(msg.sender, _amount);
        return true;
    }
}
