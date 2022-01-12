// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.7.5;
pragma abicoder v2;

import "./interfaces/IRNG.sol";
import "./interfaces/IBEP20.sol";
import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "./type/BEP721.sol";

contract YBNFT is BEP721, Ownable {
    using SafeMath for uint;
    using SafeBEP20 for IBEP20;

    address public immutable Lottery;
    address public immutable Treasury;
    address public immutable Investor;
    address public OneInch;

    mapping(uint => Strategy[]) private NFTStrategy;
    struct Strategy {
        uint percent;
        address swapToken;
        address swapAddress;
    }

    event Mint(uint256 _tokenId, address indexed _to);

    constructor(
        address _lottery,
        address _treasury,
        address _investor
    ) BEP721("YBNFT", "RubiYB") {
        require(_lottery != address(0));
        require(_treasury != address(0));
        require(_investor != address(0));

        Lottery = _lottery;
        Treasury = _treasury;
        Investor = _investor;
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
        address[] calldata _swapAddress
    ) private {
        for(uint8 ii = 0; ii < _swapToken.length; ii++) {
            NFTStrategy[_tokenId].push(Strategy({
                percent: _swapPercent[ii],
                swapToken: _swapToken[ii],
                swapAddress: _swapAddress[ii]
            }));
        }
    }

    function _swapOnOneInch(
        address fromToken,
        address toToken,
        uint256 originAmount,
        uint256[] memory exchangeDistribution
    ) private {
        bytes memory _data = abi.encodeWithSignature(
            "swap(address,address,uint256,uint256,uint256[],uint256)",
            fromToken,
            toToken,
            originAmount,
            0,
            exchangeDistribution,
            0
        );

        invoke(_data);
    }

    function setOneInch(address _1inch) public onlyOwner {
        require(_1inch != address(0));
        OneInch = _1inch;
    }

    function invoke(bytes memory _data) internal returns (bytes memory) {
        bool success;
        bytes memory _res;
        
        (success, _res) = OneInch.call(_data);
        if (!success && _res.length > 0) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            returndatacopy(0, 0, returndatasize())
            revert(0, returndatasize())
        }
        } else if (!success) {
            revert("VM: wallet invoke reverted");
        }

        return _res;
    }

    function mint(
        uint tokenId,
        uint[] calldata swapPercent,
        address[] calldata swapToken,
        address[] calldata swapAddress
    ) external onlyOwner returns(bool) {
        require(tokenId > 0);
        require(swapToken.length > 0 && swapToken.length == swapPercent.length && swapToken.length == swapAddress.length);
        require(_checkPercent(swapPercent));

        _safeMint(address(this), tokenId);

        // set strategy
        _setStrategy(
            tokenId,
            swapPercent,
            swapToken,
            swapAddress
        );

        emit Mint(tokenId, address(this));
        return true;
    }

    function deposit(
        uint tokenId, 
        uint amount, 
        address token
    ) external {
        require(msg.sender == Investor);
        require(_exists(tokenId), "BEP721: token not exist");

        IBEP20( token ).safeTransferFrom(msg.sender, address(this), amount);
        IBEP20( token ).safeApprove(OneInch, amount);

        Strategy[] memory info = NFTStrategy[tokenId];
        for(uint8 ii = 0; ii < info.length; ii++) {
            Strategy memory infoItem = info[ii];

            uint swapAmount = amount.mul(infoItem.percent).div(1e4);
            uint256[] memory distribute = new uint256[](0);
            _swapOnOneInch(token, infoItem.swapToken, swapAmount, distribute);
        }
    }
}