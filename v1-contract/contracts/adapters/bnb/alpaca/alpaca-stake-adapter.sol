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

contract AlpacaStakeAdapter is BaseAdapter {
    /**
     * @notice Construct
     * @param _pid  number of pID
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _wrapToken  address of wrap token
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _wrapToken,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        wrapToken = _wrapToken;
        pid = _pid;
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
        data = abi.encodeWithSignature(
            "deposit(address,uint256,uint256)",
            investor,
            pid,
            _amount
        );
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
        data = abi.encodeWithSignature(
            "withdraw(address,uint256,uint256)",
            investor,
            pid,
            _amount
        );
    }

    /**
     * @notice Increase withdrwal amount
     * @param _user  user address
     * @param _nftId  nftId
     * @param _amount  amount of withdrawal
     */
    /// #if_succeeds {:msg "withdrawalAmount not increased"} withdrawalAmount[_user][_nftId] == old(withdrawalAmount[_user][_nftId]) + amount;
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
