// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./interfaces/IPancakeRouter.sol";
import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "./type/BEP721.sol";

contract YBNFT1 is BEP721, Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    address public immutable lottery;
    address public immutable treasury;

    // these addresses are for testing
    address public constant WBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;
    address public constant PCS_ROUTER =
        0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3;

    mapping(address => bool) public allowedToken;
    mapping(uint256 => NFTFund[]) public nftFunds;
    mapping(uint256 => Strategy[]) private nftStrategy;
    struct NFTFund {
        address funder;
        address token;
        uint256 amount;
    }

    struct Strategy {
        uint256 percent;
        address swapToken;
        address stakeAddress;
    }

    event Mint(uint256 _tokenId, address indexed _to);
    event Deposit(
        uint256 _tokenId,
        address indexed _funder,
        address _token,
        uint256 _amount
    );

    constructor(address _lottery, address _treasury)
        BEP721("Hedgepie YBNFT", "YBNFT")
    {
        require(_lottery != address(0), "Missing lottery");
        require(_treasury != address(0), "Missing treasury");

        lottery = _lottery;
        treasury = _treasury;
    }

    function manageToken(address[] calldata tokens, bool flag)
        public
        onlyOwner
    {
        require(tokens.length > 0, "Missing tokens");

        for (uint8 i = 0; i < tokens.length; i++) {
            allowedToken[tokens[i]] = flag;
        }
    }

    function chkToken(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function _checkPercent(uint256[] calldata _swapPercent)
        private
        pure
        returns (bool)
    {
        uint256 totalPercent;
        for (uint256 ii = 0; ii < _swapPercent.length; ii++) {
            totalPercent = totalPercent.add(_swapPercent[ii]);
        }

        return totalPercent.sub(1e4) == 0;
    }

    function _setStrategy(
        uint256 _tokenId,
        uint256[] calldata _swapPercent,
        address[] calldata _swapToken,
        address[] calldata _stakeAddress
    ) private {
        for (uint8 ii = 0; ii < _swapToken.length; ii++) {
            nftStrategy[_tokenId].push(
                Strategy({
                    percent: _swapPercent[ii],
                    swapToken: _swapToken[ii],
                    stakeAddress: _stakeAddress[ii]
                })
            );
        }
    }

    function _swapOnPCS(
        uint256 _amountIn,
        address _inToken,
        address _outToken
    ) private returns (uint256 _amountOut) {
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

        uint256[] memory amounts = IPancakeRouter(PCS_ROUTER)
            .swapExactTokensForTokens(_amountIn, 0, path, address(this), 0);
        _amountOut = amounts[amounts.length - 1];
    }

    function _deposit(
        uint256 _tokenId,
        uint256 _amount,
        address _token
    ) private {
        IBEP20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // for token swap
        IBEP20(_token).safeApprove(PCS_ROUTER, _amount);

        Strategy[] memory info = nftStrategy[_tokenId];
        for (uint8 ii = 0; ii < info.length; ii++) {
            Strategy memory infoItem = info[ii];

            // swapping
            uint256 amountIn = _amount.mul(infoItem.percent).div(1e4);
            uint256 amountOut = _swapOnPCS(
                amountIn,
                _token,
                infoItem.swapToken
            );

            // staking
        }

        nftFunds[_tokenId].push(
            NFTFund({funder: msg.sender, token: _token, amount: _amount})
        );
    }

    function mint(
        uint256 tokenId,
        uint256[] calldata swapPercent,
        address[] calldata swapToken,
        address[] calldata stakeAddress
    ) external onlyOwner returns (bool) {
        require(tokenId > 0, "Invalid tokenId");
        require(
            swapToken.length > 0 &&
                swapToken.length == swapPercent.length &&
                swapToken.length == stakeAddress.length,
            "Mismatched strategies"
        );
        require(_checkPercent(swapPercent), "Incorrect percent");

        _safeMint(address(this), tokenId);

        // set strategy
        _setStrategy(tokenId, swapPercent, swapToken, stakeAddress);

        emit Mint(tokenId, address(this));
        return true;
    }

    function deposit(
        uint256 tokenId,
        uint256 amount,
        address token
    ) external returns (bool) {
        require(_exists(tokenId), "BEP721: NFT not exist");
        require(amount > 0, "Amount is 0");
        require(allowedToken[token], "Not allowed token");

        _deposit(tokenId, amount, token);

        emit Deposit(tokenId, msg.sender, token, amount);
        return true;
    }
}
