// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IYBNFT.sol";
import "./libraries/Ownable.sol";
import "./type/BEP721.sol";

contract YBNFT is BEP721, IYBNFT, Ownable {
    using Counters for Counters.Counter;

    // current max tokenId
    Counters.Counter private _tokenIdPointer;
    // tokenId => strategy[]
    mapping(uint256 => Strategy[]) public stratigies;
    // tokenId => performanceFee
    mapping(uint256 => uint256) public performanceFee;

    event Mint(address indexed minter, uint256 indexed tokenId);

    constructor() BEP721("Hedgepie YBNFT", "YBNFT") {}

    // ===== external functions =====
    function getStrategies(uint256 _tokenId)
        external
        view
        override
        returns (Strategy[] memory)
    {
        return stratigies[_tokenId];
    }

    function getPerformanceFee(uint256 _tokenId)
        external
        view
        returns (uint256)
    {
        return performanceFee[_tokenId];
    }

    function exists(uint256 _tokenId) external view override returns (bool) {
        return _exists(_tokenId);
    }

    function mint(
        uint256[] calldata _swapPercent,
        address[] calldata _swapToken,
        address[] calldata _strategyAddress,
        uint256 _performanceFee
    ) external onlyOwner returns (uint256) {
        require(
            _performanceFee < 1000,
            "Performance fee should be less than 10%"
        );
        require(
            _swapToken.length > 0 &&
                _swapToken.length == _swapPercent.length &&
                _swapToken.length == _strategyAddress.length,
            "Mismatched strategies"
        );
        require(_checkPercent(_swapPercent), "Incorrect swap percent");
        _tokenIdPointer.increment();

        // mint token
        _safeMint(msg.sender, _tokenIdPointer._value);

        // set strategy
        _setStrategy(
            _tokenIdPointer._value,
            _swapPercent,
            _swapToken,
            _strategyAddress
        );

        // set performance fee
        performanceFee[_tokenIdPointer._value] = _performanceFee;

        emit Mint(msg.sender, _tokenIdPointer._value);
        // return _tokenIdPointer._value;
        return 105;
    }

    // ===== internal functions =====
    function _setStrategy(
        uint256 _tokenId,
        uint256[] calldata _swapPercent,
        address[] calldata _swapToken,
        address[] calldata _strategyAddress
    ) internal {
        for (uint256 idx = 0; idx < _swapToken.length; ++idx) {
            stratigies[_tokenId].push(
                Strategy({
                    percent: _swapPercent[idx],
                    swapToken: _swapToken[idx],
                    strategyAddress: _strategyAddress[idx]
                })
            );
        }
    }

    function _checkPercent(uint256[] calldata _swapPercent)
        internal
        pure
        returns (bool)
    {
        uint256 totalPercent;
        for (uint256 idx = 0; idx < _swapPercent.length; idx++) {
            totalPercent = totalPercent + _swapPercent[idx];
        }

        return totalPercent <= 1e4;
    }
}
