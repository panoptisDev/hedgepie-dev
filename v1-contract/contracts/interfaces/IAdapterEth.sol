// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./IWrap.sol";
import "../adapters/BaseAdapterEth.sol";

interface IAdapterEth {
    function getPaths(address _inToken, address _outToken)
        external
        view
        returns (address[] memory);

    function stackWithdrawalAmounts(
        address _user,
        uint256 _tokenId,
        uint256 _index
    ) external view returns (uint256);

    function jar() external view returns (address);

    function DEEPTH() external view returns (uint8);

    function isVault() external view returns (bool);

    function isEntered() external view returns (bool);

    function isLeverage() external view returns (bool);

    function borrowRate() external view returns (uint256);

    function stakingToken() external view returns (address);

    function strategy() external view returns (address);

    function vStrategy() external view returns (address);

    function pendingReward() external view returns (uint256);

    function pendingShares() external view returns (uint256);

    function name() external view returns (string memory);

    function repayToken() external view returns (address);

    function rewardToken() external view returns (address);

    function rewardToken1() external view returns (address);

    function wrapToken() external view returns (address);

    function router() external view returns (address);

    function swapRouter() external view returns (address);

    function getAdapterStrategy(uint256 _adapter)
        external
        view
        returns (address);

    function getWithdrawalAmount(address _user, uint256 _nftId)
        external
        view
        returns (uint256);

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

    function getEnterMarketCallData()
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function getLoanCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function getDeLoanCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function getReward(address _user) external view returns (uint256);

    function increaseWithdrawalAmount(
        address _user,
        uint256 _nftId,
        uint256 _amount
    ) external;

    function increaseWithdrawalAmount(
        address _user,
        uint256 _nftId,
        uint256 _amount,
        uint256 _deepid
    ) external;

    function setWithdrawalAmount(
        address _user,
        uint256 _nftId,
        uint256 _amount
    ) external;

    function setIsEntered(bool _isEntered) external;

    function setInvestor(address _investor) external;

    function deposit(
        uint256 _tokenId,
        address _account,
        uint256 _amount
    ) external payable returns (uint256 amountOut);

    function withdraw(uint256 _tokenId, address _account)
        external
        payable
        returns (uint256 amountOut);

    function claim(uint256 _tokenId, address _account)
        external
        payable
        returns (uint256 amountOut);

    function pendingReward(uint256 _tokenId, address _account)
        external
        view
        returns (uint256 amountOut);

    function adapterInfos(uint256 _tokenId)
        external
        view
        returns (BaseAdapterEth.AdapterInfo memory);

    function userAdapterInfos(address _account, uint256 _tokenId)
        external
        view
        returns (BaseAdapterEth.UserAdapterInfo memory);
}
