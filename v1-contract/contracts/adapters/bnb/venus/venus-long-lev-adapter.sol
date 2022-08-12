// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapter.sol";
import "./interface/VBep20Interface.sol";
import "./interface/ComptrollerInterface.sol";

contract VenusLongLevAdapter is BaseAdapter {
    // user => nft id => withdrawal amounts stack
    mapping(address => mapping(uint256 => uint256[4]))
        public stackWithdrawalAmounts;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _name  adatper name
     */
    constructor(address _strategy, string memory _name) {
        require(
            VBep20Interface(_strategy).isVToken(),
            "Error: Invalid vToken address"
        );
        require(
            VBep20Interface(_strategy).underlying() != address(0),
            "Error: Invalid underlying address"
        );

        stakingToken = VBep20Interface(_strategy).underlying();
        repayToken = _strategy;
        strategy = _strategy;
        name = _name;

        isLeverage = true;
        borrowRate = 7900;
        DEEPTH = 3;
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
     * @notice Get enter market calldata
     */
    function getEnterMarketCallData()
        external
        view
        returns (
            address to,
            uint256 value,
            bytes memory data
        )
    {
        address[] memory _vTokens = new address[](1);
        _vTokens[0] = strategy;
        to = VBep20Interface(strategy).comptroller();
        value = 0;
        data = abi.encodeWithSignature("enterMarkets(address[])", _vTokens);
    }

    /**
     * @notice Get loan market calldata
     * @param _amount  amount of loan
     */
    function getLoanCallData(uint256 _amount)
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
        data = abi.encodeWithSignature("borrow(uint256)", _amount);
    }

    /**
     * @notice Get de-loan market calldata
     * @param _amount  amount of loan
     */
    function getDeLoanCallData(uint256 _amount)
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
        data = abi.encodeWithSignature("repayBorrow(uint256)", _amount);
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
        data = abi.encodeWithSignature("mint(uint256)", _amount);
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
        data = abi.encodeWithSignature("redeemUnderlying(uint256)", _amount);
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
        stackWithdrawalAmounts[_user][_nftId][0] += _amount;
    }

    /**
     * @notice Increase withdrwal amount
     * @param _user user address
     * @param _nftId nftId
     * @param _amount amount of withdrawal
     * @param _deepId deepth id
     */
    function increaseWithdrawalAmount(
        address _user,
        uint256 _nftId,
        uint256 _amount,
        uint256 _deepId
    ) external onlyInvestor {
        require(_deepId <= DEEPTH && _deepId != 0, "Invalid deep id");
        withdrawalAmount[_user][_nftId] += _amount;
        stackWithdrawalAmounts[_user][_nftId][_deepId] += _amount;
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
        for (uint256 i = 0; i <= DEEPTH; i++)
            stackWithdrawalAmounts[_user][_nftId][i] = _amount;
    }

    /**
     * @notice Set withdrwal amount
     * @param _isEntered entered status
     */
    function setIsEntered(bool _isEntered) external onlyInvestor {
        isEntered = _isEntered;
    }
}
