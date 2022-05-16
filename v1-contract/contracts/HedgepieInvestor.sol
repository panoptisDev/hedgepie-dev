// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./libraries/SafeBEP20.sol";
import "./libraries/Ownable.sol";

import "./interfaces/IYBNFT.sol";
import "./interfaces/IAdapter.sol";
import "./interfaces/IAdapterManager.sol";
import "./interfaces/IPancakeRouter.sol";

contract HedgepieInvestor is Ownable, ReentrancyGuard {
    using SafeBEP20 for IBEP20;

    // user => nft address => nft id => amount
    mapping(address => mapping(address => mapping(uint256 => uint256)))
        public userInfo;

    // user => strategy address => amount
    mapping(address => mapping(address => uint256)) public userStrategyInfo;

    // ybnft address
    address public ybnft;
    // swap router address
    address public swapRouter;
    // wrapped bnb address
    address public wbnb;
    // strategy manager
    address public adapterManager;

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
    event AdapterManagerChanged(address indexed user, address adapterManager);

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

        IYBNFT.Adapter[] memory adapterInfo = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );
        for (uint8 i = 0; i < adapterInfo.length; i++) {
            IYBNFT.Adapter memory adapter = adapterInfo[i];

            // swapping
            uint256 amountIn = (_amount * adapter.allocation) / 1e4;
            uint256 amountOut = _swapOnPKS(amountIn, _token, adapter.token);

            // deposit to adapter
            _depositToAdapter(adapter.token, adapter.addr, amountOut);

            userStrategyInfo[_user][adapter.addr] += amountOut;
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
        _withdraw(_user, _tokenId, _token, _amount);
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
        _withdraw(_user, _tokenId, _token, userInfo[_user][_nft][_tokenId]);
    }

    // ===== Owner functions =====
    /**
     * @notice Set strategy manager contract
     * @param _adapterManager  nft address
     */
    function setAdapterManager(address _adapterManager) external onlyOwner {
        require(_adapterManager != address(0), "Invalid NFT address");

        adapterManager = _adapterManager;

        emit AdapterManagerChanged(msg.sender, _adapterManager);
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

    function _swapOnPKS(
        uint256 _amountIn,
        address _inToken,
        address _outToken
    ) internal returns (uint256 amountOut) {
        address[] memory path = _getPaths(_inToken, _outToken);
        uint256[] memory amounts = IPancakeRouter(swapRouter)
            .swapExactTokensForTokens(
                _amountIn,
                0,
                path,
                address(this),
                block.timestamp + 2 hours
            );

        amountOut = amounts[amounts.length - 1];
    }

    /**
     * @notice deposit fund to adapter
     * @param _adapterAddr  adapter address
     * @param _amount  token amount
     */

    function _depositToAdapter(
        address _token,
        address _adapterAddr,
        uint256 _amount
    ) internal {
        IBEP20(_token).safeApprove(
            IAdapterManager(adapterManager).getAdapterStrat(_adapterAddr),
            _amount
        );

        (address to, uint256 value, bytes memory callData) = IAdapterManager(
            adapterManager
        ).getDepositCallData(_adapterAddr, _amount / 2);

        (bool success, ) = to.call{value: value}(callData);
        require(success, "Error: Deposit internal issue");
    }

    /**
     * @notice withdraw fund from adapter
     * @param _adapterAddr  adapter address
     * @param _amount  token amount
     */

    function _withdrawFromAdapter(address _adapterAddr, uint256 _amount)
        internal
    {
        // (address to, uint256 value, bytes memory callData) = IAdapterManager(
        //     adapterManager
        // ).getWithdrawCallData(_adapterAddr, _amount);

        (address to, uint256 value, bytes memory callData) = IAdapter(
            _adapterAddr
        ).getDevestCallData(_amount);

        (bool success, ) = to.call{value: value}(callData);

        require(success, "Error: Withdraw internal issue");
    }

    /**
     * @notice withdraw fund
     * @param _user  user address
     * @param _tokenId  YBNft token id
     * @param _token  token address
     * @param _amount  token amount
     */

    function _withdraw(
        address _user,
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) internal shouldMatchCaller(_user) {
        uint256 userAmount = userInfo[_user][ybnft][_tokenId];
        require(IYBNFT(ybnft).exists(_tokenId), "YBNFT: token id is invalid");
        require(_amount > 0, "Amount can not be 0");
        require(userAmount > _amount, "Withdraw: exceeded amount");

        IYBNFT.Adapter[] memory adapterInfo = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        uint256 amountOut;
        for (uint8 i = 0; i < adapterInfo.length; i++) {
            IYBNFT.Adapter memory adapter = adapterInfo[i];

            // get the amount of strategy token to be withdrawn from strategy
            uint256[] memory amounts = IPancakeRouter(swapRouter).getAmountsIn(
                (_amount * adapter.allocation) / 1e4,
                _getPaths(adapter.token, _token)
            );

            _withdrawFromAdapter(adapter.addr, _amount);

            userStrategyInfo[_user][adapter.addr] -= amounts[0];

            // swapping
            IBEP20(adapter.token).safeApprove(swapRouter, amounts[0]);
            amountOut += _swapOnPKS(amounts[0], adapter.token, _token);
        }

        IBEP20(_token).safeTransfer(_user, amountOut);
        userAmount -= _amount;

        emit Withdraw(_user, ybnft, _tokenId, _amount);
    }
}
