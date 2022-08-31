// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../BaseAdapterMatic.sol";

contract UniswapLPAdapter is BaseAdapterMatic {
    // user => nft id => tokenID
    mapping(address => mapping(uint256 => uint256)) public liquidityToken;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _router  address of reward token
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _router,
        string memory _name
    ) {
        router = _router;
        strategy = _strategy;
        stakingToken = _stakingToken;
        name = _name;

        noDeposit = true;
    }

    /**
     * @notice Set liqudityToken
     * @param _user  user address
     * @param _nftId  nftId
     * @param _tokenId  amount of withdrawal
     */
    function setLiquidityToken(
        address _user,
        uint256 _nftId,
        uint256 _tokenId
    ) external onlyInvestor {
        liquidityToken[_user][_nftId] = _tokenId;
    }

    /**
     * @notice Get liqudity token
     * @param _user  user address
     * @param _nftId  nftId
     */
    function getLiquidityToken(address _user, uint256 _nftId)
        external
        view
        returns (uint256 tokenId)
    {
        tokenId = liquidityToken[_user][_nftId];
    }
}
