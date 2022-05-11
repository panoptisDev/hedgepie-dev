// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./libraries/SafeBEP20.sol";
import "./libraries/Ownable.sol";

import "./interfaces/IYBNFT.sol";
import "./interfaces/IPancakeRouter.sol";
import "./interfaces/IStrategy.sol";
import "./interfaces/IStrategyManager.sol";

contract HedgepieInvestor is Ownable, ReentrancyGuard {
    using SafeBEP20 for IBEP20;

    // user => nft address => nft id => amount
    mapping(address => mapping(address => mapping(uint256 => uint256)))
        public userInfo;

    // user => strategy address => amount
    mapping(address => mapping(address => uint256)) public userStrategyInfo;

    // token => status
    mapping(address => bool) public allowedToken;

    // ybnft address
    address public ybnft;
    // swap router address
    address public swapRouter;
    // wrapped bnb address
    address public wbnb;
    // strategy manager
    address public strategyManager;

    event Deposit(
        address indexed user,
        address nft,
        uint256 nftId,
        uint256 amount
    );
    event Withdraw(
        address indexed user,
        address nft,
        uint256 nftId,
        uint256 amount
    );
    event TokenStatusChanged(address indexed token, bool status);
    event StrategyManagerChanged(address indexed user, address strategyManager);

    /**
     * @notice construct
     * @param _swapRouter  Pancakeswap router address (0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3 // on bsc testnet)
     * @param _wbnb  Wrapped BNB address (0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd // on bsc testnet)
     */
    constructor(
        address _ybnft,
        address _swapRouter,
        address _wbnb
    ) {
        require(_ybnft != address(0), "Error: YBNFT address missing");
        require(_swapRouter != address(0), "Error: swap router missing");
        require(_wbnb != address(0), "wbnb missing");

        ybnft = _ybnft;
        swapRouter = _swapRouter;
        wbnb = _wbnb;
    }

    // ===== modifiers =====
    modifier onlyAllowedToken(address _token) {
        require(allowedToken[_token], "Error: token is not allowed");
        _;
    }

    modifier shouldMatchCaller(address _user) {
        require(_user == msg.sender, "Caller is not matched");
        _;
    }

    /**
     * @notice deposit fund
     * @param _tokenId  YBNft token id
     * @param _token  token address
     * @param _amount  token amount
     */
    function deposit(
        address _user,
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) external shouldMatchCaller(_user) nonReentrant {
        require(_amount > 0, "Amount can not be 0");
        require(IYBNFT(ybnft).exists(_tokenId), "YBNFT: token id is invalid");

        IBEP20(_token).safeTransferFrom(_user, address(this), _amount);
        IBEP20(_token).safeApprove(swapRouter, _amount);

        IYBNFT.Strategy[] memory info = IYBNFT(ybnft).getStrategies(_tokenId);
        for (uint8 idx = 0; idx < info.length; idx++) {
            IYBNFT.Strategy memory infoItem = info[idx];

            // swapping
            uint256 amountIn = (_amount * infoItem.percent) / 1e4;
            uint256 amountOut = _swapOnPCS(
                amountIn,
                _token,
                infoItem.swapToken
            );

            // staking into strategy
            IBEP20(_token).safeApprove(infoItem.strategyAddress, _amount);
            IStrategyManager(strategyManager).deposit(
                infoItem.strategyAddress,
                amountOut
            );

            userStrategyInfo[_user][infoItem.strategyAddress] += amountOut;
        }

        userInfo[_user][ybnft][_tokenId] += _amount;

        emit Deposit(_user, ybnft, _tokenId, _amount);
    }

    /**
     * @notice withdraw fund
     * @param _user  user address
     * @param _tokenId  YBNft token id
     * @param _token  token address
     * @param _amount  token amount
     */

    function withdraw(
        address _user,
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) public shouldMatchCaller(_user) nonReentrant {
        uint256 userAmount = userInfo[_user][ybnft][_tokenId];
        require(IYBNFT(ybnft).exists(_tokenId), "YBNFT: token id is invalid");
        require(_amount > 0, "Amount can not be 0");
        require(userAmount > _amount, "Withdraw: exceeded amount");

        IYBNFT.Strategy[] memory info = IYBNFT(ybnft).getStrategies(_tokenId);
        uint256 amountOut;
        for (uint8 idx = 0; idx < info.length; idx++) {
            IYBNFT.Strategy memory infoItem = info[idx];

            // get the amount of strategy token to be withdrawn from strategy
            uint256[] memory amounts = IPancakeRouter(infoItem.strategyAddress)
                .getAmountsIn(
                    (_amount * infoItem.percent) / 1e4,
                    _getPaths(infoItem.swapToken, _token)
                );

            // unstaking into strategy
            IStrategy(infoItem.strategyAddress).withdraw(amounts[0]);
            userStrategyInfo[_user][infoItem.strategyAddress] -= amounts[0];

            // swapping
            IBEP20(infoItem.swapToken).safeApprove(swapRouter, amounts[0]);
            amountOut += _swapOnPCS(amounts[0], infoItem.swapToken, _token);
        }
        IBEP20(_token).safeTransfer(_user, amountOut);
        userAmount -= _amount;

        emit Withdraw(_user, ybnft, _tokenId, _amount);
    }

    /**
     * @notice withdraw fund
     * @param _user  user address
     * @param _nft  YBNft address
     * @param _tokenId  YBNft token id
     * @param _token  token address
     */
    function withdrawAll(
        address _user,
        address _nft,
        uint256 _tokenId,
        address _token
    ) external nonReentrant {
        withdraw(_user, _tokenId, _token, userInfo[_user][_nft][_tokenId]);
    }

    // ===== Owner functions =====
    /**
     * @notice delist nft from whitelist
     * @param _token  address of erc20 token
     * @param _status  status
     */
    function manageToken(address _token, bool _status) external onlyOwner {
        require(_token != address(0), "Invalid token address");

        allowedToken[_token] = _status;

        emit TokenStatusChanged(_token, _status);
    }

    /**
     * @notice Set strategy manager contract
     * @param _strategyManager  nft address
     */
    function setStrategyManager(address _strategyManager) external onlyOwner {
        require(_strategyManager != address(0), "Invalid NFT address");

        strategyManager = _strategyManager;

        emit StrategyManagerChanged(msg.sender, _strategyManager);
    }

    // ===== internal functions =====
    function _getPaths(address _inToken, address _outToken)
        internal
        view
        returns (address[] memory path)
    {
        if (_outToken == wbnb || _inToken == wbnb) {
            path = new address[](2);
            path[0] = _inToken;
            path[1] = _outToken;
        } else {
            path = new address[](3);
            path[0] = _inToken;
            path[1] = wbnb;
            path[2] = _outToken;
        }
    }

    function _swapOnPCS(
        uint256 _amountIn,
        address _inToken,
        address _outToken
    ) internal returns (uint256 amountOut) {
        address[] memory path = _getPaths(_inToken, _outToken);
        uint256[] memory amounts = IPancakeRouter(swapRouter)
            .swapExactTokensForTokens(_amountIn, 0, path, address(this), 1200);

        amountOut = amounts[amounts.length - 1];
    }
}
