// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./libraries/SafeBEP20.sol";

contract HedgepieInvestor {
    using SafeBEP20 for IBEP20;

    // user => token => amount
    mapping(address => mapping(address => uint256)) public userStake;

    event Stake(address indexed user, address token, uint256 amount);

    receive() external payable {}

    constructor() {}

    /**
     * @notice deposit fund
     * @param _token  token address
     * @param _amount  token amount
     */
    function deposit(address _token, uint256 _amount) public {
        require(_amount > 0, "Amount can not be 0");

        IBEP20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        userStake[msg.sender][_token] += _amount;

        emit Stake(msg.sender, _token, _amount);
    }
}
