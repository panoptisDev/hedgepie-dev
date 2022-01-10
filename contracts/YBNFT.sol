// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;

import "./interfaces/IRNG.sol";
import "./interfaces/IBEP20.sol";
import "./interfaces/IPancakeswapV2Router.sol";
import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "./type/BEP721.sol";

contract YBNFT is BEP721, Ownable {
    using SafeMath for uint16;
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    address public immutable Lottery;
    address public immutable Treasury;
    address public immutable RubiToken;

    mapping(uint => NFTFund[]) public fundList;
    struct NFTFund {
        address funder;
        address token;
        uint amount;
    }

    event Fund(uint256 _tokenId, address indexed _funder, address _token, uint _amount);
    event Mint(uint256 _tokenId, address indexed _to);

    constructor(address _lottery, address _treasury, address _rubiToken)
    BEP721("YBNFT", "RubiYB") {
        require(_lottery != address(0));
        require(_treasury != address(0));
        require(_rubiToken != address(0));

        Lottery = _lottery;
        Treasury = _treasury;
        RubiToken = _rubiToken;
    }

    function _fund(uint _tokenId, address _token, uint _amount) private {
        NFTFund[] memory fundArr = fundList[_tokenId];
    }

    function _setStrategy(
        int _tokenId, 
        uint _rubiAmount, 
        address[] memory _routerAddress, 
        address[] memory _swapAddress, 
        uint16[] memory _swapPercent
    ) private {
        IBEP20(RubiToken).safeTransferFrom(msg.sender, address(this), _rubiAmount);
        for(uint8 ii = 0; ii < _swapAddress.length; ii++) {
            address routeItem = _routerAddress[ii];
            uint inAmount = _rubiAmount.mul(_swapPercent[ii]).div(1e4);

            address[] memory path;
            path[0] = RubiToken;
            path[1] = _swapAddress[ii];

            IBEP20(RubiToken).safeApprove(routeItem, inAmount);
            IPancakeswapV2Router(routeItem).swapExactTokensForTokens(
                inAmount, 
                0, 
                path,
                address(this),
                block.timestamp
            );

            
        }
    }

    function _checkPercent(uint16[] memory _swapPercent) private pure returns(bool) {
        uint16 totalPercent;
        for(uint8 ii = 0; ii < _swapPercent.length; ii++) {
            totalPercent = totalPercent.add(_swapPercent[ii]);
        }

        return totalPercent.sub(1e4) == 0;
    }

    function fund(uint256 _tokenId, address _token, uint _amount) public returns(bool) {
        require(_amount > 0);

        _fund(_tokenId, _token, _amount);

        emit Fund(_tokenId, msg.sender, _token, _amount);
        return true;
    }

    function mint(
        uint tokenId,
        uint rubiAmount,
        address[] memory routerAddress,
        address[] memory swapAddress,
        uint16[] memory swapPercent
    ) external onlyOwner returns(bool) {
        require(tokenId > 0);
        require(swapAddress.length > 0);
        require(swapAddress.length == swapPercent.length && swapAddress.length == routerAddress.length);
        require(_checkPercent(swapPercent));

        // set strategy
        _setStrategy(
            tokenId, 
            rubiAmount, 
            routerAddress,
            swapAddress, 
            swapPercent
        );

        _mint(address(this), tokenId);

        emit Mint(tokenId, address(this));
        return true;
    }
}