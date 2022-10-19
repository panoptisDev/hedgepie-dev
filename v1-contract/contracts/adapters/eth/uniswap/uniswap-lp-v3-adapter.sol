// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

contract UniswapV3LPAdapter is BaseAdapterEth {
    // user => nft id => tokenID
    mapping(address => mapping(uint256 => uint256)) public liquidityNFT;

    int24 public tickLower;

    int24 public tickUpper;

    /**
     * @notice Construct
     * @param _strategy  address of strategy
     * @param _stakingToken  address of staking token
     * @param _router  address of reward token
     * @param _lower  tickLower
     * @param _upper  tickUpper
     * @param _weth  weth address
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _router,
        int24 _lower,
        int24 _upper,
        address _weth,
        string memory _name
    ) {
        router = _router;
        strategy = _strategy;
        stakingToken = _stakingToken;
        name = _name;
        weth = _weth;

        tickLower = _lower;
        tickUpper = _upper;
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
    ) public {
        liquidityNFT[_user][_nftId] = _tokenId;
    }

    /**
     * @notice Get liqudity token
     * @param _user  user address
     * @param _nftId  nftId
     */
    function getLiquidityNFT(address _user, uint256 _nftId)
        public
        view
        returns (uint256 tokenId)
    {
        tokenId = liquidityNFT[_user][_nftId];
    }

    /**
     * @notice Get tick info
     */
    function getTick() public view returns (int24 _lower, int24 _upper) {
        _lower = tickLower;
        _upper = tickUpper;
    }

    /**
     * @notice Deposit to uniswapV3 adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of eth
     */
    function deposit(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) external payable override returns (uint256 amountIn) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        amountIn = _deposit(_tokenId, _account, _amountIn);

        // update user info
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        userInfo.amount += amountIn;
        userInfo.invested += _amountIn;

        // update adapter info
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        adapterInfo.totalStaked += amountIn;
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateTVLInfo(_tokenId, _amountIn, true);
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateTradedInfo(_tokenId, _amountIn, true);
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateParticipantInfo(_tokenId, _account, true);
    }

    /**
     * @notice Withdraw to uniswapV3 adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of eth
     */
    function withdraw(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) external payable override returns (uint256 amountOut) {
        amountOut = _withdraw(_tokenId, _account, _amountIn);

        // update user info
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        userInfo.amount = 0;
        userInfo.invested = 0;

        // update adapter info
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        adapterInfo.totalStaked -= userInfo.amount;
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateTVLInfo(_tokenId, userInfo.invested, false);
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateTradedInfo(_tokenId, userInfo.invested, true);
        IHedgepieAdapterInfoEth(IHedgepieInvestorEth(investor).adapterInfo())
            .updateParticipantInfo(_tokenId, _account, false);

        // tax distribution
        if (amountOut != 0) {
            uint256 taxAmount = (amountOut *
                IYBNFT(IHedgepieInvestorEth(investor).ybnft()).performanceFee(
                    _tokenId
                )) / 1e4;
            (bool success, ) = payable(
                IHedgepieInvestorEth(investor).treasury()
            ).call{value: taxAmount}("");
            require(success, "Failed to send ether to Treasury");

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }
    }

    /**
     * @notice Deposit(internal)
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of eth
     */
    function _deposit(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) internal returns (uint256 amountOut) {
        // get underlying tokens of staking token
        address[2] memory tokens;
        tokens[0] = IPancakePair(stakingToken).token0();
        tokens[1] = IPancakePair(stakingToken).token1();

        // swap eth to underlying tokens and approve strategy
        uint256[4] memory tokenAmount;
        tokenAmount[0] = _amountIn / 2;
        tokenAmount[1] = _amountIn - tokenAmount[0];

        if (tokens[0] != weth) {
            tokenAmount[0] = HedgepieLibraryEth.swapOnRouter(
                address(this),
                tokenAmount[0],
                tokens[0],
                router,
                weth
            );
            IBEP20(tokens[0]).approve(strategy, tokenAmount[0]);
        }
        if (tokens[1] != weth) {
            tokenAmount[1] = HedgepieLibraryEth.swapOnRouter(
                address(this),
                tokenAmount[1],
                tokens[1],
                router,
                weth
            );
            IBEP20(tokens[1]).approve(strategy, tokenAmount[1]);
        }

        // wrap eth to weth when underlying token is wrapped token
        if (tokens[0] == weth || tokens[1] == weth) {
            IWrap(weth).deposit{
                value: tokens[0] == weth ? tokenAmount[0] : tokenAmount[1]
            }();
            IBEP20(weth).approve(
                strategy,
                tokens[0] == weth ? tokenAmount[0] : tokenAmount[1]
            );
        }

        // deposit staking token to uniswapV3 strategy (mint or increaseLiquidity)
        uint256 v3TokenId = getLiquidityNFT(_account, _tokenId);
        if (v3TokenId != 0) {
            (
                amountOut,
                tokenAmount[2],
                tokenAmount[3]
            ) = INonfungiblePositionManager(strategy).increaseLiquidity(
                INonfungiblePositionManager.IncreaseLiquidityParams({
                    tokenId: v3TokenId,
                    amount0Desired: tokenAmount[0],
                    amount1Desired: tokenAmount[1],
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp + 2 hours
                })
            );
        } else {
            int24[2] memory ticks;
            (ticks[0], ticks[1]) = getTick();
            INonfungiblePositionManager.MintParams
                memory params = INonfungiblePositionManager.MintParams({
                    token0: tokens[0],
                    token1: tokens[1],
                    fee: IPancakePair(stakingToken).fee(),
                    tickLower: ticks[0],
                    tickUpper: ticks[1],
                    amount0Desired: tokenAmount[0],
                    amount1Desired: tokenAmount[1],
                    amount0Min: 0,
                    amount1Min: 0,
                    recipient: address(this),
                    deadline: block.timestamp + 2 hours
                });

            (
                v3TokenId,
                amountOut,
                tokenAmount[2],
                tokenAmount[3]
            ) = INonfungiblePositionManager(strategy).mint(params);
            setLiquidityNFT(_account, _tokenId, v3TokenId);
        }

        if (tokenAmount[2] < tokenAmount[0]) {
            HedgepieLibraryEth.swapforEth(
                address(this),
                tokenAmount[0] - tokenAmount[2],
                tokens[0],
                router,
                weth
            );
            IBEP20(tokens[0]).approve(strategy, 0);
        }

        if (tokenAmount[3] < tokenAmount[1]) {
            HedgepieLibraryEth.swapforEth(
                address(this),
                tokenAmount[1] - tokenAmount[3],
                tokens[1],
                router,
                weth
            );
            IBEP20(tokens[1]).approve(strategy, 0);
        }
    }

    /**
     * @notice Withdraw(internal)
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of eth
     */
    function _withdraw(
        uint256 _tokenId,
        address _account,
        uint256 _amountIn
    ) public returns (uint256 amountOut) {
        // get underlying tokens of staking token
        address[2] memory tokens;
        tokens[0] = IPancakePair(stakingToken).token0();
        tokens[1] = IPancakePair(stakingToken).token1();

        uint256 tokenId = getLiquidityNFT(_account, _tokenId);
        require(tokenId != 0, "Invalid request");

        // withdraw staking token to uniswapV3 strategy (collect or decreaseLiquidity)
        uint256[2] memory amounts;
        (amounts[0], amounts[1]) = INonfungiblePositionManager(strategy)
            .decreaseLiquidity(
                INonfungiblePositionManager.DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: uint128(_amountIn),
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp + 2 hours
                })
            );

        INonfungiblePositionManager(strategy).collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: uint128(amounts[0]),
                amount1Max: uint128(amounts[1])
            })
        );

        // swap underlying tokens to weth
        if (amounts[0] != 0)
            amountOut += HedgepieLibraryEth.swapforEth(
                address(this),
                amounts[0],
                tokens[0],
                router,
                weth
            );

        if (amounts[1] != 0)
            amountOut += HedgepieLibraryEth.swapforEth(
                address(this),
                amounts[1],
                tokens[1],
                router,
                weth
            );
    }
}
