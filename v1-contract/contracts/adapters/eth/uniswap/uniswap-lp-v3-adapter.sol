// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "../../BaseAdapterEth.sol";

import "../../../libraries/HedgepieLibraryEth.sol";

import "../../../interfaces/IYBNFT.sol";
import "../../../interfaces/IHedgepieInvestorEth.sol";
import "../../../interfaces/IHedgepieAdapterInfoEth.sol";

contract UniswapV3LPAdapter is BaseAdapterEth, IERC721Receiver {
    // user => nft id => tokenID
    mapping(address => mapping(uint256 => uint256)) public liquidityNFT;

    int24 public tickLower;

    int24 public tickUpper;

    receive() external payable {}

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
     * @notice Swap ETH to tokens and approve
     * @param _token  address of token
     * @param _inAmount  amount of ETH
     */
    function _swapAndApprove(
        address _token,
        uint256 _inAmount
    ) internal returns (uint256 amountOut) {
        if (_token == weth) {
            amountOut = _inAmount;
            IWrap(weth).deposit {
                value: amountOut
            }();
        } else {
            amountOut = HedgepieLibraryEth.swapOnRouter(
                address(this),
                _inAmount,
                _token,
                router,
                weth
            );
        }

        IBEP20(_token).approve(strategy, amountOut);
    }

    /**
     * @notice Swap remaining tokens to ETH
     * @param _token  address of token
     * @param _amount  amount of token
     */
    function _removeRemain(
        address _token,
        uint256 _amount
    ) internal {
        if(_amount > 0) {
            HedgepieLibraryEth.swapforEth(
                address(this), 
                _amount, 
                _token, 
                router, 
                weth
            );
            IBEP20(_token).approve(strategy, 0);
        }
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
        (amountIn, _amountIn) = _deposit(_tokenId, _account, _amountIn);

        // update user info
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        userInfo.amount += amountIn;
        userInfo.invested += _amountIn;

        // update adapter info
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        adapterInfo.totalStaked += amountIn;
        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            true
        );
    }

    /**
     * @notice Withdraw to uniswapV3 adapter
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     */
    function withdraw(uint256 _tokenId, address _account)
        external
        payable
        override
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = _withdraw(_tokenId, _account, userInfo.amount);

        // tax distribution
        if (amountOut != 0) {
            uint256 taxAmount;
            bool success;

            if(userInfo.invested <= amountOut) {
                taxAmount = ((amountOut - userInfo.invested) *
                    IYBNFT(IHedgepieInvestorEth(investor).ybnft()).performanceFee(
                        _tokenId
                    )) / 1e4;
                (success, ) = payable(
                    IHedgepieInvestorEth(investor).treasury()
                ).call{value: taxAmount}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        address adapterInfoEthAddr = IHedgepieInvestorEth(investor)
            .adapterInfo();
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoEth(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        unchecked {
            // update adapter info
            adapterInfos[_tokenId].totalStaked -= userInfo.amount;
            
            // update user info
            userInfo.amount = 0;
            userInfo.invested = 0;
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
    ) internal returns (uint256 amountOut, uint256 ethAmount) {
        // get underlying tokens of staking token
        address[2] memory tokens;
        tokens[0] = IPancakePair(stakingToken).token0();
        tokens[1] = IPancakePair(stakingToken).token1();

        // swap eth to underlying tokens and approve strategy
        uint256[4] memory tokenAmount;
        uint256 ethBalBefore = address(this).balance - _amountIn;

        tokenAmount[0] = _swapAndApprove(tokens[0], _amountIn / 2);
        tokenAmount[1] = _swapAndApprove(tokens[1], _amountIn / 2);

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
                    deadline: block.timestamp
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
                    deadline: block.timestamp
                });

            (
                v3TokenId,
                amountOut,
                tokenAmount[2],
                tokenAmount[3]
            ) = INonfungiblePositionManager(strategy).mint(params);

            setLiquidityNFT(_account, _tokenId, v3TokenId);
        }

        _removeRemain(tokens[0], tokenAmount[0] - tokenAmount[2]);
        _removeRemain(tokens[1], tokenAmount[1] - tokenAmount[3]);

        uint256 ethBalAfter = address(this).balance;
        ethAmount = _amountIn + ethBalBefore - ethBalAfter;
        if(ethBalAfter > ethBalBefore) {
            (bool success, ) = payable(_account).call{
                value: ethBalAfter - ethBalBefore
            }("");
            require(success, "Failed to send remained ETH");
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
    ) internal returns (uint256 amountOut) {
        // get underlying tokens of staking token
        address[2] memory tokens;
        tokens[0] = IPancakePair(stakingToken).token0();
        tokens[1] = IPancakePair(stakingToken).token1();

        uint256 v3TokenId = getLiquidityNFT(_account, _tokenId);
        require(v3TokenId != 0, "Invalid request");

        // withdraw staking token to uniswapV3 strategy (collect or decreaseLiquidity)
        uint256[2] memory amounts;
        amounts[0] = IBEP20(tokens[0]).balanceOf(address(this));
        amounts[1] = IBEP20(tokens[1]).balanceOf(address(this));
        INonfungiblePositionManager(
            strategy
        ).decreaseLiquidity(
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: v3TokenId,
                liquidity: uint128(_amountIn),
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp + 2 hours
            })
        );

        INonfungiblePositionManager(strategy).collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: v3TokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            })
        );

        unchecked {
            amounts[0] = IBEP20(tokens[0]).balanceOf(address(this)) - amounts[0];
            amounts[1] = IBEP20(tokens[1]).balanceOf(address(this)) - amounts[1];
        }

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

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
