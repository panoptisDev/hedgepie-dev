// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../libraries/SafeBEP20.sol";
import "../interfaces/IYBNFT.sol";
import "../interfaces/IAdapterMatic.sol";

import "../interfaces/IStargateRouter.sol";
import "../interfaces/IStargateReceiver.sol";
import "../interfaces/IPancakeRouter.sol";

contract HedgepieInvestorMaticMock is
    Ownable,
    ReentrancyGuard,
    IStargateReceiver
{
    using SafeBEP20 for IBEP20;

    struct StargateInfo {
        uint16 dstChainId;
        uint256 srcPoolId;
        uint256 dstPoolId;
        address dstToken;
    }

    // ybnft address
    address public ybnft;

    // strategy manager
    address public adapterManager;

    // treasury address
    address public treasury;

    // adapter info
    address public adapterInfo;

    // stargate router
    address public starRouter;

    // swap router address
    address public swapRouter;

    // wmatic address
    address public wmatic;

    // mapping for stargate information: adapter address to StargateInfo
    mapping(address => StargateInfo) public adapterStarInfo;

    event DepositMATIC(
        address indexed user,
        address nft,
        uint256 nftId,
        uint256 amount
    );
    event WithdrawMATIC(
        address indexed user,
        address nft,
        uint256 nftId,
        uint256 amount
    );
    event Claimed(address indexed user, uint256 amount);
    event YieldWithdrawn(uint256 indexed nftId, uint256 amount);
    event AdapterManagerChanged(address indexed user, address adapterManager);
    event TreasuryChanged(address treasury);

    modifier onlyValidNFT(uint256 _tokenId) {
        require(
            IYBNFT(ybnft).exists(_tokenId),
            "Error: nft tokenId is invalid"
        );
        _;
    }

    /**
     * @notice Construct
     * @param _ybnft  address of YBNFT
     */
    constructor(
        address _ybnft,
        address _treasury,
        address _adapterInfo,
        address _starRouter,
        address _wmatic,
        address _swapRouter
    ) {
        require(_ybnft != address(0), "Error: YBNFT address missing");
        require(_treasury != address(0), "Error: treasury address missing");
        require(
            _starRouter != address(0),
            "Error: stargate router address missing"
        );
        require(
            _adapterInfo != address(0),
            "Error: adapterInfo address missing"
        );

        ybnft = _ybnft;
        treasury = _treasury;
        adapterInfo = _adapterInfo;
        starRouter = _starRouter;
        wmatic = _wmatic;
        swapRouter = _swapRouter;
    }

    /**
     * @notice Deposit with MATIC
     * @param _tokenId  YBNft token id
     * @param _amount  MATIC amount
     */
    function depositMATIC(
        uint256 _tokenId,
        uint256 _amount,
        uint256 _fee
    ) external payable nonReentrant onlyValidNFT(_tokenId) {
        require(
            msg.value == _amount + _fee && _amount != 0,
            "Error: Insufficient MATIC"
        );

        IYBNFT.Adapter[] memory adapterInfos = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        for (uint8 i = 0; i < adapterInfos.length; i++) {
            IYBNFT.Adapter memory adapter = adapterInfos[i];
            StargateInfo memory starInfo = adapterStarInfo[adapter.addr];

            uint256 amountIn = (_amount * adapter.allocation) / 1e4;
            if (starInfo.dstToken == address(0)) {
                IAdapterMatic(adapter.addr).deposit{value: amountIn}(
                    _tokenId,
                    amountIn,
                    msg.sender
                );
            } else {
                // Swap Matic to dstToken
                uint256 amountOut = IBEP20(starInfo.dstToken).balanceOf(
                    address(this)
                );
                address[] memory path = new address[](2);
                path[0] = wmatic;
                path[1] = starInfo.dstToken;
                IPancakeRouter(swapRouter)
                    .swapExactETHForTokensSupportingFeeOnTransferTokens{
                    value: amountIn
                }(0, path, address(this), block.timestamp + 2 hours);
                amountOut =
                    IBEP20(starInfo.dstToken).balanceOf(address(this)) -
                    amountOut;

                _deposit(
                    adapter.addr,
                    payable(address(this)),
                    amountOut,
                    IStargateRouter.lzTxObj(5e4, 10000000000000000, "0x"),
                    abi.encodePacked(adapter.addr),
                    abi.encodePacked(adapter.addr, amountOut),
                    _fee
                );
            }
        }

        emit DepositMATIC(msg.sender, ybnft, _tokenId, _amount);
    }

    /**
     * @notice Withdraw by MATIC
     * @param _tokenId  YBNft token id
     */
    function withdrawMATIC(uint256 _tokenId)
        external
        nonReentrant
        onlyValidNFT(_tokenId)
    {
        IYBNFT.Adapter[] memory adapterInfos = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        uint256 amountOut;
        for (uint8 i = 0; i < adapterInfos.length; i++) {
            amountOut += IAdapterMatic(adapterInfos[i].addr).withdraw(
                _tokenId,
                msg.sender
            );
        }

        emit WithdrawMATIC(msg.sender, ybnft, _tokenId, amountOut);
    }

    /**
     * @notice Claim
     * @param _tokenId  YBNft token id
     */
    function claim(uint256 _tokenId)
        external
        nonReentrant
        onlyValidNFT(_tokenId)
    {
        IYBNFT.Adapter[] memory adapterInfos = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        uint256 amountOut;
        for (uint8 i = 0; i < adapterInfos.length; i++) {
            amountOut += IAdapterMatic(adapterInfos[i].addr).claim(
                _tokenId,
                msg.sender
            );
        }

        emit Claimed(msg.sender, amountOut);
        emit YieldWithdrawn(_tokenId, amountOut);
    }

    /**
     * @notice pendingReward
     * @param _tokenId  YBNft token id
     * @param _account  user address
     */
    function pendingReward(uint256 _tokenId, address _account)
        public
        view
        returns (uint256 amountOut)
    {
        if (!IYBNFT(ybnft).exists(_tokenId)) return 0;

        IYBNFT.Adapter[] memory adapterInfos = IYBNFT(ybnft).getAdapterInfo(
            _tokenId
        );

        for (uint8 i = 0; i < adapterInfos.length; i++) {
            amountOut += IAdapterMatic(adapterInfos[i].addr).pendingReward(
                _tokenId,
                _account
            );
        }
    }

    /**
     * @notice Set strategy manager contract
     * @param _adapterManager  nft address
     */
    function setAdapterManager(address _adapterManager) external onlyOwner {
        require(_adapterManager != address(0), "Error: Invalid NFT address");

        adapterManager = _adapterManager;
        emit AdapterManagerChanged(msg.sender, _adapterManager);
    }

    /**
     * @notice Set stargate info for adapter
     * @param _adapterAddr  adapter address
     * @param _dstChainId  destination chain id
     * @param _srcPoolId  source pool id
     * @param _dstChainId  destination pool id
     * @param _dstToken  destination token address
     */
    function setStargateInfo(
        address _adapterAddr,
        uint16 _dstChainId,
        uint256 _srcPoolId,
        uint256 _dstPoolId,
        address _dstToken
    ) external onlyOwner {
        adapterStarInfo[_adapterAddr] = StargateInfo(
            _dstChainId,
            _srcPoolId,
            _dstPoolId,
            _dstToken
        );
    }

    /**
     * @notice Set treasury address
     * @param _treasury new treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Error: Invalid NFT address");

        treasury = _treasury;
        emit TreasuryChanged(treasury);
    }

    function _deposit(
        address _adapterAddr,
        address payable _refundAddress,
        uint256 _amountLD,
        IStargateRouter.lzTxObj memory _lzTxParams,
        bytes memory _to,
        bytes memory _payload,
        uint256 _fee
    ) internal {
        StargateInfo memory starInfo = adapterStarInfo[_adapterAddr];
        // IBEP20(_tokenAddress[0]).transferFrom(
        //     msg.sender,
        //     address(this),
        //     _amountLD
        // );
        IBEP20(starInfo.dstToken).approve(starRouter, _amountLD);

        require(_fee != 0, "Inalid deposit amount");
        // depositAmt[msg.sender] = msg.value;

        IStargateRouter(starRouter).swap{value: _fee}(
            starInfo.dstChainId,
            starInfo.srcPoolId,
            starInfo.dstPoolId,
            _refundAddress,
            _amountLD,
            0,
            _lzTxParams,
            _to,
            _payload
        );
    }

    function sgReceive(
        uint16 _chainId,
        bytes memory _srcAddress,
        uint256 _nonce,
        address _token,
        uint256 amountLD,
        bytes memory payload
    ) external override {
        emit sgReceived(
            _chainId,
            _srcAddress,
            _nonce,
            _token,
            amountLD,
            payload
        );
    }

    receive() external payable {}
}
