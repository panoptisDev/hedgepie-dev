// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "./interfaces/IPancakeRouter.sol";
import "./interfaces/IYBNFT.sol";
import "./interfaces/IHedgepieInvestor.sol";
import "./libraries/Ownable.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeBEP20.sol";
import "./type/BEP721.sol";

contract YBNFT is BEP721, IYBNFT, Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    // current max tokenId
    uint256 public tokenIdPointer;

    // lottery address
    address public lottery;
    // treasury address
    address public treasury;
    // investor address
    address public investor;
    // protocol fee
    uint256 public protocolFee;
    // token => status
    mapping(address => bool) public allowedToken;
    // tokenId => strategy[]
    mapping(uint256 => Strategy[]) public nftStrategy;
    // tokenId => performanceFee
    mapping(uint256 => uint256) public performanceFee;

    event Mint(address indexed user, uint256 indexed tokenId);

    constructor() BEP721("Hedgepie YBNFT", "YBNFT") {}

    // ===== modifiers =====
    modifier onlyAllowedToken(address token) {
        require(allowedToken[token], "Error: token is not allowed");
        _;
    }

    // TODO: ===== external functions =====
    function getNftStrategy(uint256 _tokenId)
        external
        view
        override
        returns (Strategy[] memory)
    {
        return nftStrategy[_tokenId];
    }

    function getPerformanceFee(uint256 _tokenId)
        external
        view
        returns (uint256)
    {
        return performanceFee[_tokenId];
    }

    function setInvestor(address _investor) external onlyOwner {
        require(_investor != address(0), "Missing investor");
        investor = _investor;
    }

    function setLottery(address _lottery) external onlyOwner {
        require(_lottery != address(0), "Missing lottery");
        lottery = _lottery;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Missing treasury");
        treasury = _treasury;
    }

    function setProtocolFee(uint256 _protocolFee) external onlyOwner {
        require(_protocolFee < 1000, "Protocol fee should be less than 10%");
        protocolFee = _protocolFee;
    }

    function mint(
        uint256[] calldata _swapPercent,
        address[] calldata _swapToken,
        address[] calldata _strategyAddress,
        uint256 _performanceFee
    ) external onlyOwner {
        require(
            _swapToken.length > 0 &&
                _swapToken.length == _swapPercent.length &&
                _swapToken.length == _strategyAddress.length,
            "Mismatched strategies"
        );
        require(_checkPercent(_swapPercent), "Incorrect swap percent");
        tokenIdPointer = tokenIdPointer + 1;

        // mint token
        _safeMint(msg.sender, tokenIdPointer);

        // set strategy
        _setStrategy(
            tokenIdPointer,
            _swapPercent,
            _swapToken,
            _strategyAddress
        );

        // set performance fee
        performanceFee[tokenIdPointer] = _performanceFee;

        emit Mint(address(this), tokenIdPointer);
    }

    // ===== public functions =====
    function manageToken(address[] calldata _tokens, bool _flag)
        public
        onlyOwner
    {
        for (uint8 idx = 0; idx < _tokens.length; idx++) {
            allowedToken[_tokens[idx]] = _flag;
        }
    }

    function deposit(
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) external onlyAllowedToken(_token) {
        require(_exists(_tokenId), "BEP721: NFT not exist");
        require(_amount > 0, "Amount: can't be 0");

        _deposit(_tokenId, _token, _amount);
    }

    function withdraw(
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) external onlyAllowedToken(_token) {
        require(_exists(_tokenId), "BEP721: NFT not exist");
        require(_amount > 0, "Amount: can't be 0");

        _withdraw(_tokenId, _token, _amount);
    }

    function withdraw(uint256 _tokenId, address _token)
        external
        onlyAllowedToken(_token)
    {
        require(_exists(_tokenId), "BEP721: NFT not exist");

        _withdrawAll(_tokenId, _token);
    }

    // ===== internal functions =====
    function _setStrategy(
        uint256 _tokenId,
        uint256[] calldata _swapPercent,
        address[] calldata _swapToken,
        address[] calldata _strategyAddress
    ) internal {
        for (uint8 idx = 0; idx < _swapToken.length; idx++) {
            nftStrategy[_tokenId].push(
                Strategy({
                    percent: _swapPercent[idx],
                    swapToken: _swapToken[idx],
                    strategyAddress: _strategyAddress[idx]
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
        IHedgepieInvestor(investor).deposit(
            msg.sender,
            address(this),
            _tokenId,
            _token,
            _amount
        );
    }

    function _withdraw(
        uint256 _tokenId,
        address _token,
        uint256 _amount
    ) internal {
        IHedgepieInvestor(investor).withdraw(
            msg.sender,
            address(this),
            _tokenId,
            _token,
            _amount
        );
    }

    function _withdrawAll(uint256 _tokenId, address _token) internal {
        IHedgepieInvestor(investor).withdrawAll(
            msg.sender,
            address(this),
            _tokenId,
            _token
        );
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
