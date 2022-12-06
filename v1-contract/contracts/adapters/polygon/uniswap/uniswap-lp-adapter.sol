// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "../../../libraries/HedgepieLibraryMatic.sol";
import "../../../interfaces/IHedgepieInvestorMatic.sol";
import "../../../interfaces/IHedgepieAdapterInfoMatic.sol";

contract UniswapLPAdapter is BaseAdapterMatic, IERC721Receiver {
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
     * @param _wmatic  wmatic address
     * @param _name  adatper name
     */
    constructor(
        address _strategy,
        address _stakingToken,
        address _router,
        address _wmatic,
        int24 _lower,
        int24 _upper,
        string memory _name
    ) {
        router = _router;
        strategy = _strategy;
        stakingToken = _stakingToken;
        name = _name;
        wmatic = _wmatic;

        tickLower = _lower;
        tickUpper = _upper;
    }

    /**
     * @notice Swap ETH to tokens and approve
     * @param _token  address of token
     * @param _inAmount  amount of ETH
     */
    function _swapAndApprove(address _token, uint256 _inAmount)
        internal
        returns (uint256 amountOut)
    {
        if (_token == wmatic) {
            amountOut = _inAmount;
            IWrap(wmatic).deposit{value: amountOut}();
        } else {
            amountOut = HedgepieLibraryMatic.swapOnRouter(
                _inAmount,
                address(this),
                _token,
                router,
                wmatic
            );
        }

        IBEP20(_token).approve(strategy, amountOut);
    }

    /**
     * @notice Swap remaining tokens to ETH
     * @param _token  address of token
     * @param _amount  amount of token
     */
    function _removeRemain(address _token, uint256 _amount) internal {
        if (_amount > 0) {
            HedgepieLibraryMatic.swapforMatic(
                _amount,
                address(this),
                _token,
                router,
                wmatic
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
        uint256 _amountIn,
        address _account
    ) external payable override onlyInvestor returns (uint256 amountIn) {
        require(msg.value == _amountIn, "Error: msg.value is not correct");
        (amountIn, _amountIn) = _deposit(_tokenId, _amountIn, _account);

        // update user info
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];
        userInfo.amount += amountIn;
        userInfo.invested += _amountIn;

        // update adapter info
        AdapterInfo storage adapterInfo = adapterInfos[_tokenId];
        adapterInfo.totalStaked += amountIn;
        address adapterInfoEthAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            _amountIn,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateParticipantInfo(
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
        onlyInvestor
        returns (uint256 amountOut)
    {
        UserAdapterInfo storage userInfo = userAdapterInfos[_account][_tokenId];

        amountOut = _withdraw(_tokenId, _account, userInfo.amount);

        // tax distribution
        if (amountOut != 0) {
            uint256 taxAmount;
            bool success;
            if (amountOut >= userInfo.invested) {
                taxAmount =
                    ((amountOut - userInfo.invested) *
                        IYBNFT(IHedgepieInvestorMatic(investor).ybnft())
                            .performanceFee(_tokenId)) /
                    1e4;
                (success, ) = payable(IHedgepieInvestorMatic(investor).treasury())
                    .call{value: taxAmount}("");
                require(success, "Failed to send ether to Treasury");
            }

            (success, ) = payable(_account).call{value: amountOut - taxAmount}(
                ""
            );
            require(success, "Failed to send ether");
        }

        address adapterInfoEthAddr = IHedgepieInvestorMatic(investor)
            .adapterInfo();
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateTVLInfo(
            _tokenId,
            userInfo.invested,
            false
        );
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateTradedInfo(
            _tokenId,
            userInfo.invested,
            true
        );
        IHedgepieAdapterInfoMatic(adapterInfoEthAddr).updateParticipantInfo(
            _tokenId,
            _account,
            false
        );

        unchecked {
            // update adapter info
            adapterInfos[_tokenId].totalStaked -= userInfo.amount;
        }

        delete userAdapterInfos[_account][_tokenId];
    }

    /**
     * @notice Deposit(internal)
     * @param _tokenId  YBNft token id
     * @param _account  address of depositor
     * @param _amountIn  amount of eth
     */
    function _deposit(
        uint256 _tokenId,
        uint256 _amountIn,
        address _account
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
        uint256 v3TokenId = liquidityNFT[_account][_tokenId];
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
            INonfungiblePositionManager.MintParams
                memory params = INonfungiblePositionManager.MintParams({
                    token0: tokens[0],
                    token1: tokens[1],
                    fee: IPancakePair(stakingToken).fee(),
                    tickLower: tickLower,
                    tickUpper: tickUpper,
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

            liquidityNFT[_account][_tokenId] = v3TokenId;
        }

        _removeRemain(tokens[0], tokenAmount[0] - tokenAmount[2]);
        _removeRemain(tokens[1], tokenAmount[1] - tokenAmount[3]);

        uint256 ethBalAfter = address(this).balance;
        ethAmount = _amountIn + ethBalBefore - ethBalAfter;
        if (ethBalAfter > ethBalBefore) {
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

        uint256 v3TokenId = liquidityNFT[_account][_tokenId];
        require(v3TokenId != 0, "Invalid request");

        // withdraw staking token to uniswapV3 strategy (collect or decreaseLiquidity)
        uint256[2] memory amounts;
        amounts[0] = IBEP20(tokens[0]).balanceOf(address(this));
        amounts[1] = IBEP20(tokens[1]).balanceOf(address(this));
        INonfungiblePositionManager(strategy).decreaseLiquidity(
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
            amounts[0] =
                IBEP20(tokens[0]).balanceOf(address(this)) -
                amounts[0];
            amounts[1] =
                IBEP20(tokens[1]).balanceOf(address(this)) -
                amounts[1];
        }

        // swap underlying tokens to wmatic
        if (amounts[0] != 0)
            amountOut += HedgepieLibraryMatic.swapforMatic(
                amounts[0],
                address(this),
                tokens[0],
                router,
                wmatic
            );

        if (amounts[1] != 0)
            amountOut += HedgepieLibraryMatic.swapforMatic(
                amounts[1],
                address(this),
                tokens[1],
                router,
                wmatic
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
