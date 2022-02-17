// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;
pragma abicoder v2;

import "./libraries/SafeBEP20.sol";
import "./libraries/SafeMath.sol";
import "./libraries/FixedPoint.sol";
import "./interfaces/IPancakePair.sol";

contract HedgepieVault {
    using FixedPoint for *;
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    address public immutable HedgepieToken;
    uint8 public constant blockEmission = 5;
    uint256 public totalStake;
    mapping(address => mapping(address => UserStake)) public userStake;
    struct UserStake {
        uint256 start;
        uint256 reward;
        uint256 amount;
    }

    event Stake(address indexed _staker, address _token, uint256 _amount);
    event Unstake(address indexed _unStaker, address _token, uint256 _amount);
    event rewardClaim(
        address indexed _claimer,
        address _token,
        uint256 _amount
    );

    constructor(address _hedgepie) {
        require(_hedgepie != address(0));

        HedgepieToken = _hedgepie;
    }

    function _getReward(address _token) private view returns (uint256 _reward) {
        UserStake memory info = userStake[msg.sender][_token];
        if (info.start > 0) {
            uint256 blockDiff = block.number.sub(info.start).div(blockEmission);
            _reward = totalStake > 0
                ? FixedPoint
                    .fraction(blockDiff.mul(info.amount), totalStake)
                    .decode112with18()
                : 0;
        }
    }

    function _checkUnstake(address _token, uint256 _amount)
        private
        view
        returns (bool)
    {
        UserStake memory info = userStake[msg.sender][_token];
        return info.amount >= _amount;
    }

    function _checkReward(address _token, uint256 _amount)
        private
        view
        returns (bool)
    {
        UserStake memory info = userStake[msg.sender][_token];
        return info.reward.add(_getReward(_token)) >= _amount;
    }

    function _stake(address _token, uint256 _amount) private {
        IBEP20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        UserStake memory info = userStake[msg.sender][_token];
        userStake[msg.sender][_token] = UserStake({
            amount: info.amount.add(_amount),
            reward: info.reward.add(_getReward(_token)),
            start: block.number
        });

        totalStake = totalStake.add(_amount);
    }

    function _unstake(address _token, uint256 _amount) private {
        UserStake memory info = userStake[msg.sender][_token];
        userStake[msg.sender][_token] = UserStake({
            amount: info.amount,
            reward: info.reward.add(_getReward(_token)).sub(_amount),
            start: block.number
        });

        IBEP20(_token).safeTransfer(msg.sender, _amount);
    }

    function _claimReward(address _token, uint256 _amount) private {
        UserStake memory info = userStake[msg.sender][_token];
        userStake[msg.sender][_token] = UserStake({
            amount: info.amount.sub(_amount),
            reward: info.reward.add(_getReward(_token)),
            start: block.number
        });

        totalStake = totalStake.sub(_amount);

        IBEP20(_token).safeTransfer(msg.sender, _amount);
    }

    function getStake(address token)
        public
        view
        returns (UserStake memory info)
    {
        info = userStake[msg.sender][token];
        info.reward = info.reward.add(_getReward(token));
    }

    function stake(uint256 amount) public returns (bool) {
        require(amount > 0);

        _stake(HedgepieToken, amount);

        emit Stake(msg.sender, HedgepieToken, amount);
        return true;
    }

    function stakeLP(address token, uint256 amount) public returns (bool) {
        require(amount > 0);
        require(
            IPancakePair(token).token0() == HedgepieToken ||
                IPancakePair(token).token1() == HedgepieToken,
            "Not LP token"
        );

        _stake(token, amount);

        emit Stake(msg.sender, token, amount);
        return true;
    }

    function unstake(address token, uint256 amount) public returns (bool) {
        require(amount > 0);
        require(_checkUnstake(token, amount), "Insufficient amount");

        _unstake(token, amount);

        emit Unstake(msg.sender, token, amount);
        return true;
    }

    function claimReward(address token, uint256 amount) public returns (bool) {
        require(amount > 0);
        require(_checkReward(token, amount), "Insufficient amount");

        _claimReward(token, amount);

        emit rewardClaim(msg.sender, token, amount);
        return true;
    }
}
