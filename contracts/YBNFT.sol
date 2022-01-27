// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "./interfaces/IPancakeRouter.sol";
import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "./type/BEP721.sol";

contract YBNFT is BEP721, Ownable {
    using SafeMath for uint;
    using SafeBEP20 for IBEP20;

    address public immutable Lottery;
    address public immutable Treasury;

    // these addresses are for testing
    address public constant WBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;
    address public constant PCSRouter = 0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3;

    mapping(address => bool) public AllowedToken;
    mapping(uint => NFTFund[]) public NFTFunds;
    mapping(uint => Strategy[]) private NFTStrategy;
    struct NFTFund {
        address funder;
        address token;
        uint amount;
    }

    struct Strategy {
        uint percent;
        address swapToken;
        address stakeAddress;
    }

    event Mint(uint256 _tokenId, address indexed _to);
    event Deposit(uint256 _tokenId, address indexed _funder, address _token, uint _amount);

    constructor(
        address _lottery,
        address _treasury
    ) BEP721("Hedgepie YBNFT", "YBNFT") {
        require(_lottery != address(0));
        require(_treasury != address(0));

        Lottery = _lottery;
        Treasury = _treasury;
    }

    function manageToken(
        address[] calldata tokens, 
        bool flag
    ) public onlyOwner {
        require(tokens.length > 0);

        for (uint8 i = 0; i < tokens.length; i++) {
            AllowedToken[tokens[i]] = flag;
        }
    }

    function chkToken(uint tokenId) external view returns(bool) {
        return _exists(tokenId);
    }

    function _checkPercent(
        uint[] calldata _swapPercent
    ) private pure returns(bool) {
        uint totalPercent;
        for(uint ii = 0; ii < _swapPercent.length; ii++) {
            totalPercent = totalPercent.add(_swapPercent[ii]);
        }

        return totalPercent.sub(1e4) == 0;
    }

    function _setStrategy(
        uint _tokenId,
        uint[] calldata _swapPercent,
        address[] calldata _swapToken,
        address[] calldata _stakeAddress
    ) private {
        for(uint8 ii = 0; ii < _swapToken.length; ii++) {
            NFTStrategy[_tokenId].push(Strategy({
                percent: _swapPercent[ii],
                swapToken: _swapToken[ii],
                stakeAddress: _stakeAddress[ii]
            }));
        }
    }

    function _swapOnPCS(
        uint _amountIn, 
        address _inToken, 
        address _outToken
    ) private returns(uint _amountOut) {
        address[] memory path;
        if (_outToken == WBNB || _inToken == WBNB) {
            path = new address[](2);
            path[0] = _inToken;
            path[1] = _outToken;
        } else {
            path = new address[](3);
            path[0] = _inToken;
            path[1] = WBNB;
            path[2] = _outToken;
        }

        uint[] memory amounts = IPancakeRouter( PCSRouter ).swapExactTokensForTokens(_amountIn, 0, path, address(this), 0);
        _amountOut = amounts[amounts.length - 1];
    }

    function _deposit(uint _tokenId, uint _amount, address _token) private {
        IBEP20( _token ).safeTransferFrom(msg.sender, address(this), _amount);
        
        // for token swap
        IBEP20( _token ).safeApprove(PCSRouter, _amount);

        Strategy[] memory info = NFTStrategy[_tokenId];
        for(uint8 ii = 0; ii < info.length; ii++) {
            Strategy memory infoItem = info[ii];

            // swapping
            uint amountIn = _amount.mul(infoItem.percent).div(1e4);
            uint amountOut = _swapOnPCS(amountIn, _token, infoItem.swapToken);

            // staking

        }

        NFTFunds[_tokenId].push(NFTFund({
            funder: msg.sender,
            token: _token,
            amount: _amount
        }));
    }

    function mint(
        uint tokenId,
        uint[] calldata swapPercent,
        address[] calldata swapToken,
        address[] calldata stakeAddress
    ) external onlyOwner returns(bool) {
        require(tokenId > 0);
        require(swapToken.length > 0 && swapToken.length == swapPercent.length && swapToken.length == stakeAddress.length);
        require(_checkPercent(swapPercent));

        _safeMint(address(this), tokenId);

        // set strategy
        _setStrategy(
            tokenId,
            swapPercent,
            swapToken,
            stakeAddress
        );

        emit Mint(tokenId, address(this));
        return true;
    }

    function deposit(
        uint tokenId,
        uint amount,
        address token
    ) external returns(bool) {
        require(_exists(tokenId), "BEP721: NFT not exist");
        require(amount > 0);
        require(AllowedToken[token], "Not allowed token");

        _deposit(tokenId, amount, token);

        emit Deposit(tokenId, msg.sender, token, amount);
        return true;
    }
}