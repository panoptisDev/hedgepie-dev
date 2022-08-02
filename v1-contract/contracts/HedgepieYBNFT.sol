// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IYBNFT.sol";
import "./libraries/Ownable.sol";
import "./type/BEP721.sol";

contract YBNFT is BEP721, Ownable {
    using Counters for Counters.Counter;

    struct Adapter {
        uint256 allocation;
        address token;
        address addr;
    }

    // current max tokenId
    Counters.Counter private _tokenIdPointer;
    // tokenId => token uri
    mapping(uint256 => string) private _tokenURIs;
    // tokenId => Adapter[]
    mapping(uint256 => Adapter[]) public adapterInfo;
    // tokenId => performanceFee
    mapping(uint256 => uint256) public performanceFee;

    event Mint(address indexed minter, uint256 indexed tokenId);

    /**
     * @notice Construct
     */
    constructor() BEP721("Hedgepie YBNFT", "YBNFT") {}

    /**
     * @notice Get current nft token id
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdPointer._value;
    }

    /**
     * @notice Get adapter info from nft tokenId
     * @param _tokenId  YBNft token id
     */
    function getAdapterInfo(uint256 _tokenId)
        public
        view
        returns (Adapter[] memory)
    {
        return adapterInfo[_tokenId];
    }

    /**
     * @notice Get tokenURI from token id
     * @param _tokenId token id
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return _tokenURIs[_tokenId];
    }

    /**
     * @notice Check if nft id is existed
     * @param _tokenId  YBNft token id
     */
    function exists(uint256 _tokenId) public view returns (bool) {
        return _exists(_tokenId);
    }

    /**
     * @notice Mint nft with adapter infos
     * @param _adapterAllocations  allocation of adapters
     * @param _adapterTokens  token of adapters
     * @param _adapterAddrs  address of adapters
     */
    function mint(
        uint256[] calldata _adapterAllocations,
        address[] calldata _adapterTokens,
        address[] calldata _adapterAddrs,
        uint256 _performanceFee,
        string memory _tokenURI
    ) external {
        require(
            _performanceFee < 1000,
            "Performance fee should be less than 10%"
        );
        require(
            _adapterTokens.length > 0 &&
                _adapterTokens.length == _adapterAllocations.length &&
                _adapterTokens.length == _adapterAddrs.length,
            "Mismatched adapters"
        );
        require(
            _checkPercent(_adapterAllocations),
            "Incorrect adapter allocation"
        );

        _tokenIdPointer.increment();
        performanceFee[_tokenIdPointer._value] = _performanceFee;

        _safeMint(msg.sender, _tokenIdPointer._value);
        _setTokenURI(_tokenIdPointer._value, _tokenURI);
        _setAdapterInfo(
            _tokenIdPointer._value,
            _adapterAllocations,
            _adapterTokens,
            _adapterAddrs
        );

        emit Mint(msg.sender, _tokenIdPointer._value);
    }

    /**
     * @notice Set token uri
     * @param _tokenId  token id
     * @param _tokenURI  token uri
     */
    function _setTokenURI(uint256 _tokenId, string memory _tokenURI)
        internal
        virtual
    {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[_tokenId] = _tokenURI;
    }

    /**
     * @notice Set adapter infos of nft from token id
     * @param _adapterAllocations  allocation of adapters
     * @param _adapterTokens  adapter token
     * @param _adapterAddrs  address of adapters
     */
    function _setAdapterInfo(
        uint256 _tokenId,
        uint256[] calldata _adapterAllocations,
        address[] calldata _adapterTokens,
        address[] calldata _adapterAddrs
    ) internal {
        for (uint256 i = 0; i < _adapterTokens.length; ++i) {
            adapterInfo[_tokenId].push(
                Adapter({
                    allocation: _adapterAllocations[i],
                    token: _adapterTokens[i],
                    addr: _adapterAddrs[i]
                })
            );
        }
    }

    /**
     * @notice Check if total percent of adapters is valid
     * @param _adapterAllocations  allocation of adapters
     */
    function _checkPercent(uint256[] calldata _adapterAllocations)
        internal
        pure
        returns (bool)
    {
        uint256 totalAlloc;
        for (uint256 i = 0; i < _adapterAllocations.length; i++) {
            totalAlloc = totalAlloc + _adapterAllocations[i];
        }

        return totalAlloc <= 1e4;
    }
}
