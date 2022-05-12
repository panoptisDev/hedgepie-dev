// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

interface IAdapter {
    function strategy() external view returns (address strategy);

    function getAdapterStrategy(uint256 _adapter)
        external
        view
        returns (address strategy);

    function getInvestCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function getDevestCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function invest(uint256 _amount) external;

    function withdraw(uint256 _amount) external;
}
