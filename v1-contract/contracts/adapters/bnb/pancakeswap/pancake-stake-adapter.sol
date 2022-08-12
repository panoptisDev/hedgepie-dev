// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapter.sol";

interface IMasterChef {
    function pendingAlpaca(uint256 pid, address user)
        external
        view
        returns (uint256);

    function userInfo(uint256 pid, address user)
        external
        view
        returns (uint256, uint256);
}

contract PancakeStakeAdapter is BaseAdapter {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        name = _name;
    }

    /**
     * @notice Get withdrwal amount
     * @param _user  user address
     * @param _nftId  nftId
     */
    function getWithdrawalAmount(address _user, uint256 _nftId)
        external
        view
        returns (uint256 amount)
    {
        amount = withdrawalAmount[_user][_nftId];
    }

    /**
     * @notice Get invest calldata
     * @param _amount  amount of invest
     */
    function getInvestCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("deposit(uint256)", _amount);
    }

    /**
     * @notice Get devest calldata
     * @param _amount  amount of devest
     */
    function getDevestCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = strategy;
        value = 0;
        data = abi.encodeWithSignature("withdraw(uint256)", _amount);
    }

    /**
     * @notice Increase withdrwal amount
     * @param _user  user address
     * @param _nftId  nftId
     * @param _amount  amount of withdrawal
     */
    function increaseWithdrawalAmount(
        address _user,
        uint256 _nftId,
        uint256 _amount
    ) external onlyInvestor {
        withdrawalAmount[_user][_nftId] += _amount;
    }

    /**
     * @notice Set withdrwal amount
     * @param _user  user address
     * @param _nftId  nftId
     * @param _amount  amount of withdrawal
     */
    function setWithdrawalAmount(
        address _user,
        uint256 _nftId,
        uint256 _amount
    ) external onlyInvestor {
        withdrawalAmount[_user][_nftId] = _amount;
    }

    /**
     * @notice Get pending AUTO token reward
     */
    function pendingReward() external view override returns (uint256 reward) {
        reward = IMasterChef(strategy).pendingAlpaca(pid, msg.sender);
    }

    /**
     * @notice Get pending shares
     */
    function pendingShares() external view override returns (uint256 shares) {
        (shares, ) = IMasterChef(strategy).userInfo(pid, msg.sender);
    }
}
