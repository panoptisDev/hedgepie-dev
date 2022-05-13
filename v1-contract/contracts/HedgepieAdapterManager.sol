// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/Ownable.sol";
import "./interfaces/IAdapter.sol";

contract HedgepieAdapterManager is Ownable {
    // strategy address => status
    mapping(address => bool) public adapters;

    // investor address
    address public investor;

    event AdapterAdded(address strategy);
    event AdapterRemoveed(address strategy);

    // ===== modifiers =====
    /**
     * @dev Throws if adapter is not active
     */
    modifier onlyActiveAdapter(address _adapter) {
        require(adapters[_adapter], "Error: Adapter was not listed");
        _;
    }

    /**
     * @dev Throws if called by any account other than the investor.
     */
    modifier onlyInvestor() {
        require(msg.sender == investor, "Error: caller is not investor");
        _;
    }

    // /**
    //  * @notice Deposit from strategy
    //  * @param _adapter  strategy address
    //  * @param _amount  deposit amount
    //  */
    // function deposit(address _adapter, uint256 _amount)
    //     external
    // // onlyActiveAdapter(_adapter)
    // // onlyInvestor
    // {
    //     require(_amount > 0, "Amount can not be 0");

    //     IAdapter(_adapter).invest(_amount);
    // }

    // /**
    //  * @notice Withdraw from adapter
    //  * @param _adapter  adapter address
    //  * @param _amount  withdraw amount
    //  */
    // function withdraw(address _adapter, uint256 _amount)
    //     external
    //     onlyActiveAdapter(_adapter)
    //     onlyInvestor
    // {
    //     require(_amount > 0, "Amount can not be 0");

    //     IAdapter(_adapter).withdraw(_amount);
    // }

    /**
     * @notice Get strategy address of adapter contract
     * @param _adapter  adapter address
     */
    function getAdapterStrat(address _adapter)
        external
        view
        onlyActiveAdapter(_adapter)
        returns (address adapterStrat)
    {
        adapterStrat = IAdapter(_adapter).strategy();
    }

    /**
     * @notice Get Deposit call data of adapter contract
     * @param _adapter  adapter address
     * @param _amount  deposit amount
     */
    function getDepositCallData(address _adapter, uint256 _amount)
        external
        view
        onlyActiveAdapter(_adapter)
        onlyInvestor
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        require(_amount > 0, "Amount can not be 0");
        return IAdapter(_adapter).getInvestCallData(_amount);
    }

    /**
     * @notice Get Withdraw call data of adapter contract
     * @param _adapter  adapter address
     * @param _amount  deposit amount
     */
    function getWithdrawCallData(address _adapter, uint256 _amount)
        external
        view
        onlyActiveAdapter(_adapter)
        onlyInvestor
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        require(_amount > 0, "Amount can not be 0");
        return IAdapter(_adapter).getDevestCallData(_amount);
    }

    // ===== Owner functions =====
    /**
     * @notice Add adapter
     * @param _adapter  adapter address
     */
    function addAdapter(address _adapter) external onlyOwner {
        require(_adapter != address(0), "Invalid adapter address");

        adapters[_adapter] = true;

        emit AdapterAdded(_adapter);
    }

    /**
     * @notice Remove adapter
     * @param _adapter  adapter address
     */
    function removeAdapter(address _adapter) external onlyOwner {
        require(_adapter != address(0), "Invalid adapter address");

        adapters[_adapter] = false;

        emit AdapterAdded(_adapter);
    }

    /**
     * @notice Set investor contract
     * @param _investor  investor address
     */
    function setInvestor(address _investor) external onlyOwner {
        require(_investor != address(0), "Invalid investor address");

        investor = _investor;
    }
}
