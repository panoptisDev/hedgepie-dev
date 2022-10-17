// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract BaseAdapterEth is Ownable {
    struct UserAdapterInfo {
        uint256 amount; // Current staking token amount
        uint256 userShares; // First reward token share
        uint256 userShares1; // Second reward token share
    }

    struct AdapterInfo {
        uint256 accTokenPerShare; // Accumulated per share for first reward token
        uint256 accTokenPerShare1; // Accumulated per share for second reward token
        uint256 totalStaked; // Total staked staking token
    }

    uint256 public pid;

    address public stakingToken;

    address public rewardToken;

    address public rewardToken1;

    address public repayToken;

    address public strategy;

    address public router;

    address public swapRouter;

    address public investor;

    string public name;

    bool public isReward;

    bool public isVault;

    address public weth;

    // inToken => outToken => paths
    mapping(address => mapping(address => address[])) public paths;

    // user => nft id => withdrawal amount
    mapping(address => mapping(uint256 => uint256)) public withdrawalAmount;

    // user => nft id => UserAdapterInfo
    mapping(address => mapping(uint256 => UserAdapterInfo))
        public userAdapterInfos;

    // nft id => AdapterInfo
    mapping(uint256 => AdapterInfo) public adapterInfos;

    modifier onlyInvestor() {
        require(msg.sender == investor, "Error: Caller is not investor");
        _;
    }

    /**
     * @notice Get path
     * @param _inToken token address of inToken
     * @param _outToken token address of outToken
     */
    function getPaths(address _inToken, address _outToken)
        external
        view
        onlyInvestor
        returns (address[] memory)
    {
        require(
            paths[_inToken][_outToken].length > 1,
            "Path length is not valid"
        );
        require(
            paths[_inToken][_outToken][0] == _inToken,
            "Path is not existed"
        );
        require(
            paths[_inToken][_outToken][paths[_inToken][_outToken].length - 1] ==
                _outToken,
            "Path is not existed"
        );

        return paths[_inToken][_outToken];
    }

    /**
     * @notice Set paths from inToken to outToken
     * @param _inToken token address of inToken
     * @param _outToken token address of outToken
     * @param _paths swapping paths
     */
    function setPath(
        address _inToken,
        address _outToken,
        address[] memory _paths
    ) external onlyOwner {
        require(_paths.length > 1, "Invalid paths length");
        require(_inToken == _paths[0], "Invalid inToken address");
        require(
            _outToken == _paths[_paths.length - 1],
            "Invalid inToken address"
        );

        uint8 i;

        for (i = 0; i < _paths.length; i++) {
            if (i < paths[_inToken][_outToken].length) {
                paths[_inToken][_outToken][i] = _paths[i];
            } else {
                paths[_inToken][_outToken].push(_paths[i]);
            }
        }

        if (paths[_inToken][_outToken].length > _paths.length)
            for (
                i = 0;
                i < paths[_inToken][_outToken].length - _paths.length;
                i++
            ) paths[_inToken][_outToken].pop();
    }

    /**
     * @notice Set investor
     * @param _investor  address of investor
     */
    function setInvestor(address _investor) external onlyOwner {
        require(_investor != address(0), "Error: Investor zero address");
        investor = _investor;
    }

    /**
     * @notice Get pending reward
     */
    function getReward(address) external view virtual returns (uint256) {
        return 0;
    }

    /**
     * @notice Get pending shares
     */
    function pendingShares() external view virtual returns (uint256 shares) {
        return 0;
    }

    /**
     * @notice deposit to strategy
     * @param _account address of user
     * @param _amountIn payable eth from Investor
     */
    function deposit(address _account, uint256 _amountIn)
        external
        payable
        virtual
    {}

    /**
     * @notice withdraw from strategy
     * @param _account address of user
     * @param _amountIn payable eth from Investor
     */
    function withdraw(address _account, uint256 _amountIn)
        external
        payable
        virtual
    {}

    /**
     * @notice claim reward from strategy
     * @param _account address of user
     * @param _tokenId YBNFT token id
     */
    function claim(address _account, uint256 _tokenId)
        external
        payable
        virtual
    {}

    /**
     * @notice Get pending token reward
     */
    function pendingReward() external view virtual returns (uint256 reward) {
        reward = 0;
    }
}
