// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../BaseAdapter.sol";

interface IMasterChef {
    function pendingAUTO(uint256 pid, address user)
        external
        view
        returns (uint256);

    function userInfo(uint256 pid, address user)
        external
        view
        returns (uint256, uint256);
}

contract AutoVaultAdapter is BaseAdapter {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _vStrategy  address of vault strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _router  address of DEX router
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _vStrategy,
        address _stakingToken,
        address _rewardToken,
        address _router,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        vStrategy = _vStrategy;
        name = _name;
        router = _router;
        isVault = true;
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
            "deposit(uint256,uint256)",
            pid,
            _amount
        );
    }

    /**
     * @notice Get devest calldata`
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
            "withdraw(uint256,uint256)",
            pid,
            _amount
        );
    }

    /**
     * @notice Get pending AUTO token reward
     */
    function pendingReward() external view override returns (uint256 reward) {
        reward = IMasterChef(strategy).pendingAUTO(pid, msg.sender);
    }

    /**
     * @notice Get pending shares
     */
    function pendingShares() external view override returns (uint256 shares) {
        (shares, ) = IMasterChef(strategy).userInfo(pid, msg.sender);
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
     * @notice Set poolId
     * @param _pid pool in masterchef
     */
    function setPoolID(uint256 _pid) external onlyOwner {
        pid = _pid;
    }
}
