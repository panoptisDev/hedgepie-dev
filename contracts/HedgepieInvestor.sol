// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./libraries/SafeBEP20.sol";
import "./libraries/Ownable.sol";

import "./interfaces/IYBNFT.sol";
import "./interfaces/IPancakeRouter.sol";
import "./interfaces/IStrategy.sol";

contract HedgepieInvestor is Ownable {
    using SafeBEP20 for IBEP20;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    struct UserStrategyInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    // user => nft address => nft id =>  UserInfo
    mapping(address => mapping(address => mapping(uint256 => UserInfo)))
        public userInfo;

    // user => strategy address => amount
    mapping(address => mapping(address => uint256)) public userStrategyInfo;

    // nft => listed status
    mapping(address => bool) public nftWhiteList; // whitelisted nfts

    // wrapped bnb address
    address public wbnb;
    // pancakeswap router address
    address public pancakeswapRouter;

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
    event NftListed(address indexed user, address nft);
    event NftDeListed(address indexed user, address nft);

    /**
     * @notice construct
     * @param _pancakeswapRouter  Pancakeswap router address (0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3 // on bsc testnet)
     * @param _wbnb  Wrapped BNB address (0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd // on bsc testnet)
     */
    constructor(address _pancakeswapRouter, address _wbnb) {
        require(_pancakeswapRouter != address(0), "pancake router missing");
        require(_wbnb != address(0), "wbnb missing");

        pancakeswapRouter = _pancakeswapRouter;
        wbnb = _wbnb;
    }

    // ===== modifiers =====
    modifier onlyWhiteListedNft(address _nft) {
        require(nftWhiteList[_nft], "Error: nft was not listed");
        _;
    }

    /**
     * @notice deposit fund
     * @param _nft  YBNft address
     * @param _tokenId  YBNft token id
     * @param _token  token address
     * @param _amount  token amount
     */
    function deposit(
        address _user,
        address _nft,
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) external onlyWhiteListedNft(msg.sender) {
        require(_amount > 0, "Amount can not be 0");

        IBEP20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // for token swap
        IBEP20(_token).safeApprove(pancakeswapRouter, _amount);

        // TODO: strategy handling // should think more
        IYBNFT.Strategy[] memory info = IYBNFT(_nft).getNftStrategy(_tokenId);
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
            IStrategy(infoItem.stakeAddress).stake(amountOut);
            userStrategyInfo[_user][infoItem.stakeAddress] = amountOut;
        }

        UserInfo storage user = userInfo[_user][_nft][_tokenId];
        user.amount = user.amount + _amount;

        emit Deposit(_user, _nft, _tokenId, _amount);
    }

    /**
     * @notice withdraw fund
     * @param _nft  YBNft address
     * @param _tokenId  YBNft token id
     * @param _token  token address
     * @param _amount  token amount
     */
    function withdraw(
        address _user,
        address _nft,
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) external onlyWhiteListedNft(msg.sender) {
        require(_amount > 0, "Amount can not be 0");

        UserInfo storage user = userInfo[_user][_nft][_tokenId];
        require(user.amount > _amount, "Withdraw: exceeded amount");

        IBEP20(_token).safeTransfer(msg.sender, _amount);

        user.amount = user.amount - _amount;

        emit Withdraw(_user, _nft, _tokenId, _amount);
    }

    /**
     * @notice withdraw fund
     * @param _nft  YBNft address
     * @param _tokenId  YBNft token id
     * @param _token  token address
     */
    function withdrawAll(
        address _user,
        address _nft,
        uint256 _tokenId,
        address _token
    ) external onlyWhiteListedNft(msg.sender) {
        UserInfo storage user = userInfo[_user][_nft][_tokenId];
        require(user.amount > 0, "Withdraw: amount is 0");

        IBEP20(_token).safeTransfer(msg.sender, user.amount);

        uint256 amount = user.amount;
        user.amount = 0;

        emit Withdraw(_user, _nft, _tokenId, amount);
    }

    // ===== Owner functions =====
    /**
     * @notice list nft into whitelist
     * @param _nft  nft address
     */
    function listNft(address _nft) external onlyOwner {
        require(_nft != address(0), "Invalid NFT address");

        nftWhiteList[_nft] = true;

        emit NftListed(msg.sender, _nft);
    }

    /**
     * @notice delist nft from whitelist
     * @param _nft  nft address
     */
    function deListNft(address _nft) external onlyOwner {
        require(_nft != address(0), "Invalid NFT address");

        nftWhiteList[_nft] = false;

        emit NftDeListed(msg.sender, _nft);
    }

    // TODO: ===== internal functions =====
    function _swapOnPCS(
        uint256 _amountIn,
        address _inToken,
        address _outToken
    ) internal returns (uint256 amountOut) {
        address[] memory path;
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

        uint256[] memory amounts = IPancakeRouter(pancakeswapRouter)
            .swapExactTokensForTokens(_amountIn, 0, path, address(this), 1200);
        amountOut = amounts[amounts.length - 1];
    }
}
