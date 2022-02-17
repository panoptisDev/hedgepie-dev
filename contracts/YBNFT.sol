// SPDX-License-Identifier: AGPL-3.0-or-later
// pragma solidity ^0.7.5;
pragma solidity ^0.8.4;

import "./interfaces/IPancakeRouter.sol";
import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "./type/BEP721.sol";

contract YBNFT is BEP721, Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    struct Strategy {
        uint256 percent;
        address swapToken;
        address stakeAddress;
    }

    struct NFTFund {
        address funder;
        address token;
        uint256 amount;
    }

    address public immutable lottery;
    address public immutable treasury;

    // these addresses are for testing
    address public constant WBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;
    address public constant PCSRouter =
        0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3;

    mapping(address => bool) public allowedToken;
    mapping(uint256 => Strategy[]) private nftStrategy;
    mapping(uint256 => NFTFund[]) public NFTFunds;

    // ===== events =====
    event Mint(uint256 indexed tokenId, address indexed user);
    event Deposit(
        uint256 indexed tokenId,
        address indexed user,
        address token,
        uint256 amount
    );

    // ===== modifiers =====
    modifier onlyAllowedToken(address token) {
        require(allowedToken[token], "Error: token is not allowed");
        _;
    }

    constructor(address _lottery, address _treasury)
        BEP721("Hedgepie YBNFT", "YBNFT")
    {
        require(_lottery != address(0));
        require(_treasury != address(0));

        lottery = _lottery;
        treasury = _treasury;
    }

    // ===== view functions =====
    function chkToken(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    // ===== internal functions =====
    function _setStrategy(
        uint256 _tokenId,
        uint256[] calldata _swapPercent,
        address[] calldata _swapToken,
        address[] calldata _stakeAddress
    ) private {
        for (uint8 idx = 0; idx < _swapToken.length; idx++) {
            nftStrategy[_tokenId].push(
                Strategy({
                    percent: _swapPercent[idx],
                    swapToken: _swapToken[idx],
                    stakeAddress: _stakeAddress[idx]
                })
            );
        }
    }

    function _deposit(
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) internal {
        IBEP20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // for token swap
        IBEP20(_token).safeApprove(PCSRouter, _amount);

        Strategy[] memory info = nftStrategy[_tokenId];
        for (uint8 idx = 0; idx < info.length; idx++) {
            Strategy memory infoItem = info[idx];

            // swapping
            uint256 amountIn = _amount.mul(infoItem.percent).div(1e4);
            uint256 amountOut = _swapOnPCS(
                amountIn,
                _token,
                infoItem.swapToken
            );

            // staking
        }

        NFTFunds[_tokenId].push(
            NFTFund({funder: msg.sender, token: _token, amount: _amount})
        );
    }

    function _checkPercent(uint256[] calldata _swapPercent)
        internal
        pure
        returns (bool)
    {
        uint256 totalPercent;
        for (uint256 idx = 0; idx < _swapPercent.length; idx++) {
            totalPercent = totalPercent.add(_swapPercent[idx]);
        }

        return totalPercent.sub(1e4) == 0;
    }

    function _swapOnPCS(
        uint256 _amountIn,
        address _inToken,
        address _outToken
    ) internal returns (uint256 amountOut) {
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

        uint256[] memory amounts = IPancakeRouter(PCSRouter)
            .swapExactTokensForTokens(_amountIn, 0, path, address(this), 0);
        amountOut = amounts[amounts.length - 1];
    }

    // external functions
    function mint(
        uint256 _tokenId,
        uint256[] calldata _swapPercent,
        address[] calldata _swapToken,
        address[] calldata _stakeAddress
    ) external onlyOwner {
        // TODO: tokenId should be increased automatically, no need to check _tokenId here!
        require(_tokenId > 0);
        require(
            _swapToken.length > 0 &&
                _swapToken.length == _swapPercent.length &&
                _swapToken.length == _stakeAddress.length,
            "Error: strategy data is incorrect"
        );
        require(_checkPercent(_swapPercent));

        // mint token
        _safeMint(address(this), _tokenId);

        // set strategy
        _setStrategy(_tokenId, _swapPercent, _swapToken, _stakeAddress);

        emit Mint(_tokenId, address(this));
    }

    function manageToken(address[] calldata _tokens, bool _flag)
        public
        onlyOwner
    {
        require(_tokens.length > 0);

        for (uint8 idx = 0; idx < _tokens.length; idx++) {
            allowedToken[_tokens[idx]] = _flag;
        }
    }

    function deposit(
        uint256 _tokenId,
        uint256 _amount,
        address _token
    ) external onlyAllowedToken(_token) {
        require(_exists(_tokenId), "BEP721: NFT not exist");
        require(_amount > 0);

        _deposit(_tokenId, _token, _amount);

        emit Deposit(_tokenId, msg.sender, _token, _amount);
    }
}
