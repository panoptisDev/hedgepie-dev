// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./IWrap.sol";

interface IAdapter {
    function isVault() external view returns (bool);

    function noDeposit() external view returns (bool);

    function isReward() external view returns (bool);

    function stakingToken() external view returns (address);

    function liquidityToken() external view returns (address);

    function strategy() external view returns (address);

    function lpStakingToken() external view returns (address);

    function lpProvider() external view returns (address);

    function lpPoolId() external view returns (uint256);

    function poolID() external view returns (address);

    function pendingReward() external view returns (uint256);

    function pendingReward1() external view returns (uint256);

    function pendingShares() external view returns (uint256);

    function name() external view returns (string memory);

    function repayToken() external view returns (address);

    function rewardToken() external view returns (address);

    function rewardToken1() external view returns (address);

    function router() external view returns (address);

    function getTick() external view returns (int24, int24);

    function getReward(address _user) external view returns (uint256);

    function setInvestor(address _investor) external;

    function getAdapterStrategy(uint256 _adapter)
        external
        view
        returns (address);

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

    function getRewardCallData()
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function getAddLiqCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function getRemoveLiqCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function increaseWithdrawalAmount(
        address _user,
        uint256 _nftId,
        uint256 _amount
    ) external;

    function setWithdrawalAmount(
        address _user,
        uint256 _nftId,
        uint256 _amount
    ) external;

    function getWithdrawalAmount(address _user, uint256 _nftId)
        external
        view
        returns (uint256);

    function setLiquidityNFT(
        address _user,
        uint256 _nftId,
        uint256 _tokenId
    ) external;

    function getLiquidityNFT(address _user, uint256 _nftId)
        external
        view
        returns (uint256);

    function getLPCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function removeLPCallData(uint256 _amount)
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        );

    function getPaths(address _inToken, address _outToken)
        external
        view
        returns (address[] memory);

    function stackWithdrawalAmounts(
        address _user,
        uint256 _tokenId,
        uint256 _index
    ) external view returns (uint256);
}
