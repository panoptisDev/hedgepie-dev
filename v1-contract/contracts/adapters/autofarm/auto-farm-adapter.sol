// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IMasterChef {
    function pendingAUTO(uint256 pid, address user)
        external
        view
        returns (uint256);
}

contract AutoFarmAdapter is Ownable {
    // LP Token address
    address public stakingToken;

    // Auto token address
    address public rewardToken;

    // Address(0)
    address public repayToken;

    // AutoFarm MasterChef
    address public strategy;

    // Pool ID
    uint256 public poolID;

    // Router address
    address public router;

    // Name
    string public name;

    // Investor contract address
    address public investor;

    // Swap path for token0
    address[] public path;

    // user => nft id => withdrawal amount
    mapping(address => mapping(uint256 => uint256)) public withdrawalAmount;

    modifier onlyInvestor() {
        require(msg.sender == investor, "Error: Caller is not investor");
        _;
    }

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _rewardToken  address of reward token
     * @param _router  address of DEX router
     * @param _poolID  poolID of MasterChef
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _rewardToken,
        address _router,
        uint256 _poolID,
        address[] memory _path0,
        string memory _name
    ) {
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        strategy = _strategy;
        name = _name;
        router = _router;
        poolID = _poolID;
        path = _path0;
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
            poolID,
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
            poolID,
            _amount
        );
    }

    /**
     * @notice Get pending AUTO token reward
     */
    function pendingReward() external view returns (uint256 reward) {
        reward = IMasterChef(strategy).pendingAUTO(poolID, msg.sender);
    }

    /**
     * @notice Get path
     */
    function getPaths() external view onlyInvestor returns (address[] memory) {
        return path;
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
     * @notice Set investor
     * @param _investor  address of investor
     */
    function setInvestor(address _investor) external onlyOwner {
        require(_investor != address(0), "Error: Investor zero address");
        investor = _investor;
    }
}
