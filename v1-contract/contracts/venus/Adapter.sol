// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interface/VBep20Interface.sol";

contract VenusAdapter is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public rewardFee;

    mapping(address => bool) public isVToken;

    // vToken => nToken
    mapping(address => address) public nTokens;

    // nToken => vToken
    mapping(address => address) public vTokens;

    constructor(uint256 rewardFee_) public {
        rewardFee = rewardFee_;
    }

    modifier onlyEOA() {
        require(msg.sender == tx.origin, "Sender is contract");
        _;
    }

    function _approveVToken(address _vToken, uint256 _amount) internal {
        if (IERC20(_vToken).allowance(address(this), _vToken) < _amount) {
            IERC20(_vToken).approve(_vToken, 2**256 - 1);
        }
    }

    function supply(address _nToken, uint256 _amount)
        external
        onlyEOA
        nonReentrant
    {
        require(nTokens[_nToken] != address(0), "vToken is not set or invalid");

        address _vToken = nTokens[_nToken];

        _approveVToken(_vToken, _amount);
        IERC20(_nToken).safeTransferFrom(msg.sender, address(this), _amount);

        require(
            VBep20Interface(_vToken).mint(_amount) == 0,
            "Venus Protocol Error"
        );
        IERC20(_vToken).safeTransfer(
            msg.sender,
            IERC20(_vToken).balanceOf(address(this))
        );
    }

    function redeem(address _vToken, uint256 _amount) external {
        require(isVToken[_vToken], "vToken is not set or invalid");

        _approveVToken(_vToken, _amount);
        IERC20(_vToken).safeTransferFrom(msg.sender, address(this), _amount);

        require(
            VBep20Interface(_vToken).borrow(_amount) == 0,
            "Venus Protocol Error"
        );
        IERC20(vTokens[_vToken]).safeTransfer(
            msg.sender,
            IERC20(vTokens[_vToken]).balanceOf(address(this))
        );
    }

    function borrow(
        address _cToken,
        address _vToken,
        uint256 _amount
    ) external {
        require(isVToken[_vToken], "vToken is not set or invalid");

        _approveVToken(_cToken, 2**256 - 1);

        uint256 cTokenBal = IERC20(_cToken).balanceOf(msg.sender);

        IERC20(_cToken).safeTransferFrom(msg.sender, address(this), cTokenBal);
        require(
            VBep20Interface(_vToken).borrow(_amount) == 0,
            "Venus Protocol Error"
        );
        IERC20(vTokens[_vToken]).safeTransfer(
            msg.sender,
            IERC20(vTokens[_vToken]).balanceOf(address(this))
        );
        IERC20(_cToken).safeTransfer(msg.sender, cTokenBal);
    }

    function repay(address _vToken, uint256 _amount) external {
        require(isVToken[_vToken], "vToken is not set or invalid");

        _approveVToken(_vToken, _amount);
        IERC20(_vToken).safeTransferFrom(msg.sender, address(this), _amount);

        require(
            VBep20Interface(_vToken).repayBorrow(_amount) == 0,
            "Venus Protocol Error"
        );
        IERC20(vTokens[_vToken]).safeTransfer(
            msg.sender,
            IERC20(vTokens[_vToken]).balanceOf(address(this))
        );
    }

    function addVTokens(address[] memory _vTokens, address[] memory _nTokens)
        external
        onlyOwner
    {
        require(
            _vTokens.length == _nTokens.length && _vTokens.length != 0,
            "Invalid array length"
        );

        for (uint256 i = 0; i < _vTokens.length; i++) {
            require(_vTokens[i] != address(0), "Invalid Bep20 token address");
            require(_nTokens[i] != address(0), "Invalid Bep20 token address");

            isVToken[_vTokens[i]] = true;
            nTokens[_vTokens[i]] = _nTokens[i];
            vTokens[_nTokens[i]] = _vTokens[i];
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
