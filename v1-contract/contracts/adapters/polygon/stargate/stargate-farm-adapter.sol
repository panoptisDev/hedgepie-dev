// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

interface IStakingRewards {
    function pendingStargate(uint256 poolId, address account)
        external
        view
        returns (uint256);

    function balanceOf(address account) external view returns (uint256);
}

contract StargateFarmAdapter is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _lpStakingToken  address of lp staking token
     * @param _rewardToken  address of reward token
     * @param _router  address of reward token
     * @param _lpProvider  address of lp provider
     * @param _poolId  pool id
     * @param _lpPoolId  lpToken pool id
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _lpStakingToken,
        address _rewardToken,
        address _router,
        address _lpProvider,
        uint256 _poolId,
        uint256 _lpPoolId,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        lpStakingToken = _lpStakingToken;
        rewardToken = _rewardToken;
        router = _router;
        lpProvider = _lpProvider;
        strategy = _strategy;
        name = _name;
        pid = _poolId;
        lpPoolId = _lpPoolId;
    }

    /**
     * @notice Get lp calldata
     * @param _amount  amount of underlying asset
     */
    function getLPCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = lpProvider;
        value = 0;
        data = abi.encodeWithSignature(
            "addLiquidity(uint256,uint256,address)",
            lpPoolId,
            _amount,
            msg.sender
        );
    }

    /**
     * @notice remove lp calldata
     * @param _amount  amount of underlying asset
     */
    function removeLPCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        to = lpProvider;
        value = 0;
        data = abi.encodeWithSignature(
            "instantRedeemLocal(uint16,uint256,address)",
            lpPoolId,
            _amount,
            msg.sender
        );
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
            "withdraw(uint256,uint256)",
            pid,
            _amount
        );
    }

    /**
     * @notice Get reward calldata
     */
    function getRewardCallData()
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
        data = abi.encodeWithSignature("getReward()");
    }

    function pendingReward() external view override returns (uint256 reward) {
        reward = IStakingRewards(strategy).pendingStargate(pid, msg.sender);
    }
}
