// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

contract UniswapLPAdapter is BaseAdapterMatic {
    // user => nft id => tokenID
    mapping(address => mapping(uint256 => uint256)) public liquidityNFT;

    int24 public tickLower;

    int24 public tickUpper;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _router  address of reward token
     * @param _name  adatper name
     * @param _lower  tickLower
     * @param _upper  tickUpper
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _router,
        int24 _lower,
        int24 _upper,
        string memory _name
    ) {
        router = _router;
        strategy = _strategy;
        stakingToken = _stakingToken;
        name = _name;

        tickLower = _lower;
        tickUpper = _upper;

        noDeposit = true;
    }

    /**
     * @notice Set liqudityToken
     * @param _user  user address
     * @param _nftId  nftId
     * @param _tokenId  amount of withdrawal
     */
    function setLiquidityNFT(
        address _user,
        uint256 _nftId,
        uint256 _tokenId
    ) external onlyInvestor {
        liquidityNFT[_user][_nftId] = _tokenId;
    }

    /**
     * @notice Get liqudity token
     * @param _user  user address
     * @param _nftId  nftId
     */
    function getLiquidityNFT(address _user, uint256 _nftId)
        external
        view
        returns (uint256 tokenId)
    {
        tokenId = liquidityNFT[_user][_nftId];
    }

    function getTick() external view returns (int24 _lower, int24 _upper) {
        _lower = tickLower;
        _upper = tickUpper;
    }
}
