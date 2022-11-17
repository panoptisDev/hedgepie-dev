// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

contract AaveMarketV2Adapter is BaseAdapterMatic {
    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _repayToken  address of repay token
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _repayToken,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        repayToken = _repayToken;
        strategy = _strategy;
        name = _name;
        isVault = true;
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
            "deposit(address,uint256,address,uint16)",
            stakingToken,
            _amount,
            investor,
            0
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
            "withdraw(address,uint256,address)",
            stakingToken,
            _amount,
            investor
        );
    }
}
