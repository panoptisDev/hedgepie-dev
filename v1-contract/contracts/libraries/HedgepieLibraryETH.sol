// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

import "./SafeBEP20.sol";
import "./Ownable.sol";

import "../interfaces/IYBNFT.sol";
import "../interfaces/IAdapterETH.sol";
import "../interfaces/IPancakePair.sol";
import "../interfaces/IPancakeRouter.sol";
import "../interfaces/IAdapterManagerETH.sol";

import "../HedgepieInvestorETH.sol";

library HedgepieLibraryETH {
    function getPaths(
        address _adapter,
        address _inToken,
        address _outToken
    ) public view returns (address[] memory path) {
        return IAdapterETH(_adapter).getPaths(_inToken, _outToken);
    }

    function swapOnRouter(
        address _adapter,
        uint256 _amountIn,
        address _outToken,
        address _router,
        address weth
    ) public returns (uint256 amountOut) {
        address[] memory path = getPaths(_adapter, weth, _outToken);
        uint256 beforeBalance = IBEP20(_outToken).balanceOf(address(this));

        IPancakeRouter(_router)
            .swapExactETHForTokensSupportingFeeOnTransferTokens{
            value: _amountIn
        }(0, path, address(this), block.timestamp + 2 hours);

        uint256 afterBalance = IBEP20(_outToken).balanceOf(address(this));
        amountOut = afterBalance - beforeBalance;
    }

    function swapforETH(
        address _adapter,
        uint256 _amountIn,
        address _inToken,
        address _router,
        address weth
    ) public returns (uint256 amountOut) {
        if (_inToken == weth) {
            IWrap(weth).withdraw(_amountIn);
            amountOut = _amountIn;
        } else {
            address[] memory path = getPaths(_adapter, _inToken, weth);
            uint256 beforeBalance = address(this).balance;

            IBEP20(_inToken).approve(address(_router), _amountIn);

            IPancakeRouter(_router)
                .swapExactTokensForETHSupportingFeeOnTransferTokens(
                    _amountIn,
                    0,
                    path,
                    address(this),
                    block.timestamp + 2 hours
                );

            uint256 afterBalance = address(this).balance;
            amountOut = afterBalance - beforeBalance;
        }
    }

    function getRewards(
        HedgepieInvestorETH.AdapterInfo calldata _adapter,
        HedgepieInvestorETH.UserAdapterInfo calldata _userAdapterInfo,
        address _adapterAddr
    ) public view returns (uint256 reward) {
        if (
            IAdapterETH(_adapterAddr).rewardToken() != address(0) &&
            _adapter.totalStaked != 0 &&
            _adapter.accTokenPerShare != 0
        ) {
            reward =
                ((_adapter.accTokenPerShare - _userAdapterInfo.userShares) *
                    _userAdapterInfo.amount) /
                1e12;
        }
    }

    function getDepositAmount(
        address[2] memory addrs,
        address _adapter,
        bool isVault
    ) public view returns (uint256 amountOut) {
        amountOut = addrs[0] != address(0)
            ? IBEP20(addrs[0]).balanceOf(address(this))
            : (
                isVault
                    ? IAdapterETH(_adapter).pendingShares()
                    : addrs[1] != address(0)
                    ? IBEP20(addrs[1]).balanceOf(address(this))
                    : 0
            );
    }

    function depositToAdapter(
        address _adapterManager,
        address _account,
        uint256 _tokenId,
        uint256 _amount,
        IYBNFT.Adapter memory _adapter,
        HedgepieInvestorETH.UserAdapterInfo storage _userAdapterInfo,
        HedgepieInvestorETH.AdapterInfo storage _adapterInfo
    ) public {
        uint256[3] memory amounts;
        address[2] memory addrs;
        addrs[0] = IAdapterETH(_adapter.addr).repayToken();
        addrs[1] = IAdapterETH(_adapter.addr).rewardToken();
        bool isVault = IAdapterETH(_adapter.addr).isVault();

        amounts[0] = getDepositAmount([addrs[0], addrs[1]], _adapter.addr, isVault);

        (
            address to,
            uint256 value,
            bytes memory callData
        ) = IAdapterManagerETH(_adapterManager).getDepositCallData(
                _adapter.addr,
                _amount
            );

        IBEP20(_adapter.token).approve(
            IAdapterManagerETH(_adapterManager).getAdapterStrat(
                _adapter.addr
            ),
            _amount
        );
        (bool success, ) = to.call{value: value}(callData);
        require(success, "Error: Deposit internal issue");

        amounts[1] = getDepositAmount([addrs[0], addrs[1]], _adapter.addr, isVault);
        
        unchecked { amounts[2] = amounts[1] - amounts[0]; }
        if (addrs[1] != address(0)) {
            // Farm Pool
            if (addrs[1] == IAdapterETH(_adapter.addr).stakingToken())
                amounts[2] += _amount;

            if (_adapterInfo.totalStaked != 0 && addrs[0] == address(0)) {
                if (amounts[2] != 0)
                _adapterInfo.accTokenPerShare +=
                    (amounts[2] * 1e12) /
                    _adapterInfo.totalStaked;
            }

            if (_userAdapterInfo.amount == 0)
                _userAdapterInfo.userShares = _adapterInfo.accTokenPerShare;

            amounts[2] = _amount;
        } else if (isVault) {
            require(amounts[2] > 0, "Error: Deposit failed");

            unchecked { _userAdapterInfo.userShares += amounts[2]; }
        } else if (addrs[0] != address(0)) {
            require(amounts[2] > 0, "Error: Deposit failed");
        } else {
            amounts[2] = _amount;
        }

        IAdapterETH(_adapter.addr).increaseWithdrawalAmount(
            _account,
            _tokenId,
            amounts[2]
        );
    }

    function getLP(
        IYBNFT.Adapter memory _adapter,
        address weth,
        address _account,
        uint256 _amountIn,
        uint256 _tokenId
    ) public returns (uint256 amountOut) {
        address[2] memory tokens;
        tokens[0] = IPancakePair(_adapter.token).token0();
        tokens[1] = IPancakePair(_adapter.token).token1();
        bool noDeposit = IAdapterETH(_adapter.addr).noDeposit();
        address _router = IAdapterETH(_adapter.addr).router();
        address _strategy = noDeposit
            ? IAdapterETH(_adapter.addr).strategy()
            : _router;

        uint256[2] memory tokenAmount;
        tokenAmount[0] = _amountIn / 2;
        tokenAmount[1] = _amountIn - tokenAmount[0];
        if (tokens[0] != weth) {
            tokenAmount[0] = swapOnRouter(
                _adapter.addr,
                tokenAmount[0],
                tokens[0],
                _router,
                weth
            );
            IBEP20(tokens[0]).approve(_strategy, tokenAmount[0]);
        }

        if (tokens[1] != weth) {
            tokenAmount[1] = swapOnRouter(
                _adapter.addr,
                tokenAmount[1],
                tokens[1],
                _router,
                weth
            );
            IBEP20(tokens[1]).approve(_strategy, tokenAmount[1]);
        }

        if (noDeposit) {
            uint256 tokenId = IAdapterETH(_adapter.addr).getLiquidityNFT(
                _account,
                _tokenId
            );

            // wrap to weth
            if (tokens[0] == weth) {
                IWrap(weth).deposit(tokenAmount[0]);
                IBEP20(weth).approve(_strategy, tokenAmount[0]);
            } else if (tokens[0] == weth) {
                IWrap(weth).deposit(tokenAmount[1]);
                IBEP20(weth).approve(_strategy, tokenAmount[1]);
            }

            if (tokenId != 0) {
                INonfungiblePositionManager.IncreaseLiquidityParams
                    memory params = INonfungiblePositionManager
                        .IncreaseLiquidityParams({
                            tokenId: tokenId,
                            amount0Desired: tokenAmount[0],
                            amount1Desired: tokenAmount[1],
                            amount0Min: 0,
                            amount1Min: 0,
                            deadline: block.timestamp + 2 hours
                        });

                (amountOut, , ) = INonfungiblePositionManager(_strategy)
                    .increaseLiquidity(params);
            } else {
                int24[2] memory ticks;
                (ticks[0], ticks[1]) = IAdapterETH(_adapter.addr).getTick();
                INonfungiblePositionManager.MintParams
                    memory params = INonfungiblePositionManager.MintParams({
                        token0: tokens[0],
                        token1: tokens[1],
                        fee: IPancakePair(_adapter.token).fee(),
                        tickLower: ticks[0],
                        tickUpper: ticks[1],
                        amount0Desired: tokenAmount[0],
                        amount1Desired: tokenAmount[1],
                        amount0Min: 0,
                        amount1Min: 0,
                        recipient: address(this),
                        deadline: block.timestamp + 2 hours
                    });

                (tokenId, amountOut, , ) = INonfungiblePositionManager(
                    _strategy
                ).mint(params);
                IAdapterETH(_adapter.addr).setLiquidityNFT(
                    _account,
                    _tokenId,
                    tokenId
                );
            }
        } else if (tokenAmount[0] != 0 && tokenAmount[1] != 0) {
            if (tokens[0] == weth || tokens[1] == weth) {
                (, , amountOut) = IPancakeRouter(_router).addLiquidityETH{
                    value: tokens[0] == weth ? tokenAmount[0] : tokenAmount[1]
                }(
                    tokens[0] == weth ? tokens[1] : tokens[0],
                    tokens[0] == weth ? tokenAmount[1] : tokenAmount[0],
                    0,
                    0,
                    address(this),
                    block.timestamp + 2 hours
                );
            } else {
                (, , amountOut) = IPancakeRouter(_router).addLiquidity(
                    tokens[0],
                    tokens[1],
                    tokenAmount[0],
                    tokenAmount[1],
                    0,
                    0,
                    address(this),
                    block.timestamp + 2 hours
                );
            }
        }
    }

    function withdrawLP(
        IYBNFT.Adapter memory _adapter,
        address weth,
        address _account,
        uint256 _amountIn,
        uint256 _tokenId
    ) public returns (uint256 amountOut) {
        address[2] memory tokens;
        tokens[0] = IPancakePair(_adapter.token).token0();
        tokens[1] = IPancakePair(_adapter.token).token1();

        address _router = IAdapterETH(_adapter.addr).router();

        if (IAdapterETH(_adapter.addr).noDeposit()) {
            uint256 tokenId = IAdapterETH(_adapter.addr).getLiquidityNFT(
                _account,
                _tokenId
            );
            require(tokenId != 0, "Invalid request");

            INonfungiblePositionManager.DecreaseLiquidityParams
                memory params = INonfungiblePositionManager
                    .DecreaseLiquidityParams({
                        tokenId: tokenId,
                        liquidity: uint128(_amountIn),
                        amount0Min: 0,
                        amount1Min: 0,
                        deadline: block.timestamp + 2 hours
                    });
            (uint256 amount0, uint256 amount1) = INonfungiblePositionManager(
                IAdapterETH(_adapter.addr).strategy()
            ).decreaseLiquidity(params);

            if (amountOut != 0) {
                if (tokens[0] == weth) {
                    IWrap(tokens[0]).withdraw(amount0);
                    amountOut += amount0;
                } else {
                    amountOut += swapforETH(
                        _adapter.addr,
                        amount0,
                        tokens[0],
                        _router,
                        weth
                    );
                }
            }

            if (amount1 != 0) {
                if (tokens[1] == weth) {
                    IWrap(tokens[1]).withdraw(amount1);
                    amountOut += amount1;
                } else {
                    // amountOut += swapforETH(_adapter, amount1, token1, _router, weth);
                }
            }
        } else {
            IBEP20(_adapter.token).approve(_router, _amountIn);

            if (tokens[0] == weth || tokens[1] == weth) {
                address tokenAddr = tokens[0] == weth ? tokens[1] : tokens[0];
                (uint256 amountToken, uint256 amountETH) = IPancakeRouter(
                    _router
                ).removeLiquidityETH(
                        tokenAddr,
                        _amountIn,
                        0,
                        0,
                        address(this),
                        block.timestamp + 2 hours
                    );

                amountOut = amountETH;
                amountOut += swapforETH(
                    _adapter.addr,
                    amountToken,
                    tokenAddr,
                    _router,
                    weth
                );
            } else {
                (uint256 amountA, uint256 amountB) = IPancakeRouter(_router)
                    .removeLiquidity(
                        tokens[0],
                        tokens[1],
                        _amountIn,
                        0,
                        0,
                        address(this),
                        block.timestamp + 2 hours
                    );

                amountOut += swapforETH(
                    _adapter.addr,
                    amountA,
                    tokens[0],
                    _router,
                    weth
                );
                amountOut += swapforETH(
                    _adapter.addr,
                    amountB,
                    tokens[1],
                    _router,
                    weth
                );
            }
        }
    }

    function getLPLiquidity(
        address _adapterAddr,
        address _adapterToken,
        uint256 _amountIn,
        address _adapterManager,
        address _swapRouter,
        address _weth
    ) public returns (uint256 amountOut) {
        address _liquidity = IAdapterETH(_adapterAddr).liquidityToken();
        amountOut = swapOnRouter(
            _adapterAddr,
            _amountIn,
            _liquidity,
            _swapRouter,
            _weth
        );
        IBEP20(_liquidity).approve(IAdapterETH(_adapterAddr).router(), amountOut);

        uint256 beforeBalance = IBEP20(_adapterToken).balanceOf(address(this));

        (
            address to,
            uint256 value,
            bytes memory callData
        ) = IAdapterManagerETH(_adapterManager).getAddLiqCallData(
                _adapterAddr,
                amountOut
            );

        (bool success, ) = to.call{value: value}(callData);
        require(success, "Error: Pool internal issue");

        unchecked {
            amountOut =
                IBEP20(_adapterToken).balanceOf(address(this)) -
                beforeBalance;
        }
    }

    function withdrawLPLiquidity(
        address _adapterAddr,
        address _adapterToken,
        uint256 _amountIn,
        address _adapterManager,
        address _swapRouter,
        address _weth
    ) public returns (uint256 amountOut) {
        address _liquidity = IAdapterETH(_adapterAddr).liquidityToken();
        uint256 beforeBalance = IBEP20(_liquidity).balanceOf(address(this));

        IBEP20(_adapterToken).approve(
            IAdapterETH(_adapterAddr).router(),
            _amountIn
        );

        (
            address to,
            uint256 value,
            bytes memory callData
        ) = IAdapterManagerETH(_adapterManager).getRemoveLiqCallData(
                _adapterAddr,
                _amountIn
            );

        (bool success, ) = to.call{value: value}(callData);
        require(success, "Error: Pool internal issue");

        amountOut = IBEP20(_liquidity).balanceOf(address(this)) - beforeBalance;
        amountOut = swapforETH(
            _adapterAddr,
            amountOut,
            _liquidity,
            _swapRouter,
            _weth
        );
    }
}
