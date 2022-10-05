// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

contract ApeswapFarmAdapter is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _pid  number of poolid
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of 1st reward token
     * @param _rewardToken1  address of 2nd reward token
     * @param _router  address of reward token
     * @param _name  adatper name
     */
    constructor(
        uint256 _pid,
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _rewardToken1,
        address _router,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        rewardToken1 = _rewardToken1;
        router = _router;
        strategy = _strategy;
        name = _name;
        pid = _pid;
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
            "deposit(uint256,uint256,address)", 
            pid,
            _amount,
            investor
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
            "withdrawAndHarvest(uint256,uint256,address)", 
            pid,
            _amount,
            investor
        );
    }
}