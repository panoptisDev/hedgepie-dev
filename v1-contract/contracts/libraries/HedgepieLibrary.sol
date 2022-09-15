// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "../libraries/SafeBEP20.sol";
import "../libraries/Ownable.sol";

import "../interfaces/IYBNFT.sol";
import "../interfaces/IAdapter.sol";
import "../interfaces/IPancakePair.sol";
import "../interfaces/IPancakeRouter.sol";
import "../interfaces/IVaultStrategy.sol";
import "../interfaces/IAdapterManager.sol";

import "../HedgepieInvestorMatic.sol";
import "../HedgepieInvestor.sol";

library HedgepieLibrary {
    function getRewards(
        HedgepieInvestor.AdapterInfo calldata _adapter,
        HedgepieInvestor.UserAdapterInfo calldata _userAdapterInfo,
        address _adapterAddr
    ) public view returns (uint256) {
        if (
            IAdapter(_adapterAddr).rewardToken() == address(0) ||
            _adapter.totalStaked == 0 ||
            _adapter.accTokenPerShare == 0
        ) return 0;

        return
            ((_adapter.accTokenPerShare - _userAdapterInfo.userShares) *
                _userAdapterInfo.amount) / 1e12;
    }

    function getRewardsMatic(
        HedgepieInvestorMatic.AdapterInfo calldata _adapter,
        HedgepieInvestorMatic.UserAdapterInfo calldata _userAdapterInfo,
        address _adapterAddr
    ) public view returns (uint256 reward, uint256 reward1) {
        if (
            IAdapter(_adapterAddr).rewardToken() != address(0) &&
            _adapter.totalStaked != 0 &&
            _adapter.accTokenPerShare != 0
        ) {
            reward = ((_adapter.accTokenPerShare - _userAdapterInfo.userShares) *
                _userAdapterInfo.amount) / 1e12;
            reward1 = ((_adapter.accTokenPerShare1 - _userAdapterInfo.userShares1) *
                _userAdapterInfo.amount) / 1e12;
        }
    }

    function getPaths(
        address _adapter,
        address _inToken,
        address _outToken
    ) public view returns (address[] memory path) {
        return IAdapter(_adapter).getPaths(_inToken, _outToken);
    }

    function swapOnRouter(
        address _adapter,
        uint256 _amountIn,
        address _outToken,
        address _router,
        address wbnb
    ) public returns (uint256 amountOut) {
        address[] memory path = getPaths(_adapter, wbnb, _outToken);
        uint256 beforeBalance = IBEP20(_outToken).balanceOf(address(this));

        IPancakeRouter(_router)
            .swapExactETHForTokensSupportingFeeOnTransferTokens{
            value: _amountIn
        }(0, path, address(this), block.timestamp + 2 hours);

        uint256 afterBalance = IBEP20(_outToken).balanceOf(address(this));
        amountOut = afterBalance - beforeBalance;
    }

    function swapforCoin(
        address _adapter,
        uint256 _amountIn,
        address _inToken,
        address _router,
        address wbnb
    ) public returns (uint256 amountOut) {
        if(_inToken == wbnb) {
            IWrap(wbnb).withdraw(_amountIn);
            amountOut = _amountIn;
        } else {
            address[] memory path = getPaths(_adapter, _inToken, wbnb);
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

    function getLP(
        IYBNFT.Adapter memory _adapter,
        address wbnb,
        uint256 _amountIn
    ) public returns (uint256 amountOut) {
        address[2] memory tokens;
        tokens[0] = IPancakePair(_adapter.token).token0();
        tokens[1] = IPancakePair(_adapter.token).token1();
        address _router = IAdapter(_adapter.addr).router();

        uint256[2] memory tokenAmount;
        tokenAmount[0] = _amountIn / 2;
        tokenAmount[1] = _amountIn - tokenAmount[0];
        if (tokens[0] != wbnb) {
            tokenAmount[0] = swapOnRouter(
                _adapter.addr,
                tokenAmount[0],
                tokens[0],
                _router,
                wbnb
            );
            IBEP20(tokens[0]).approve(_router, tokenAmount[0]);
        }

        if (tokens[1] != wbnb) {
            tokenAmount[1] = swapOnRouter(
                _adapter.addr,
                tokenAmount[1],
                tokens[1],
                _router,
                wbnb
            );
            IBEP20(tokens[1]).approve(_router, tokenAmount[1]);
        }
        
        if (tokenAmount[0] != 0 && tokenAmount[1] != 0) {
            amountOut = addLiquidity(
                tokens[0],
                tokens[1],
                wbnb,
                _router,
                tokenAmount[0],
                tokenAmount[1]
            );
        }
    }

    function leverageAsset(
        address _adapterManager,
        address _adapterAddr,
        uint256 _tokenId,
        uint256 _amount,
        address _account,
        HedgepieInvestor.UserAdapterInfo storage userAdapterInfo,
        HedgepieInvestor.AdapterInfo storage adapterInfo
    ) public {
        uint256[2] memory amounts;
        uint256 value;
        address to;
        bool success;
        bytes memory callData;

        if (!IAdapter(_adapterAddr).isEntered()) {
            (
                to,
                value,
                callData
            ) = IAdapterManager(_adapterManager).getEnterMarketCallData(
                    _adapterAddr
                );

            (success, ) = to.call{value: value}(callData);
            require(success, "Error: EnterMarket internal issue");

            IAdapter(_adapterAddr).setIsEntered(true);
            IBEP20(IAdapter(_adapterAddr).repayToken()).approve(
                IAdapter(_adapterAddr).strategy(),
                2**256 - 1
            );
        }

        IAdapter(_adapterAddr).increaseWithdrawalAmount(
            _account,
            _tokenId,
            _amount
        );

        for (uint256 i = 0; i < IAdapter(_adapterAddr).DEEPTH(); i++) {
            amounts[0] = IBEP20(IAdapter(_adapterAddr).stakingToken())
                .balanceOf(address(this));

            (to, value, callData) = IAdapterManager(_adapterManager)
                .getLoanCallData(
                    _adapterAddr,
                    (_amount * IAdapter(_adapterAddr).borrowRate()) / 10000
                );

            (success, ) = to.call{value: value}(callData);
            require(success, "Error: Borrow internal issue");

            amounts[1] = IBEP20(IAdapter(_adapterAddr).stakingToken())
                .balanceOf(address(this));
            require(amounts[0] < amounts[1], "Error: Borrow failed");

            _amount = amounts[1] - amounts[0];

            IBEP20(IAdapter(_adapterAddr).stakingToken()).approve(
                IAdapterManager(_adapterManager).getAdapterStrat(_adapterAddr),
                _amount
            );

            (to, value, callData) = IAdapterManager(_adapterManager)
                .getDepositCallData(_adapterAddr, _amount);
            (success, ) = to.call{value: value}(callData);
            require(success, "Error: Re-deposit internal issue");

            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                _account,
                _tokenId,
                _amount,
                i + 1
            );
            userAdapterInfo.amount += _amount;
            adapterInfo.totalStaked += _amount;
        }
    }

    function repayAsset(
        address _adapterManager,
        address _adapterAddr,
        uint256 _tokenId,
        address _account
    ) public {
        require(
            IAdapter(_adapterAddr).isEntered(),
            "Error: Not entered market"
        );

        uint256 _amount;
        uint256 bAmt;
        uint256 aAmt;
        address to;
        uint256 value;
        bytes memory callData;
        bool success;

        for (uint256 i = IAdapter(_adapterAddr).DEEPTH(); i > 0; i--) {
            _amount = IAdapter(_adapterAddr).stackWithdrawalAmounts(
                _account,
                _tokenId,
                i
            );

            bAmt = IBEP20(IAdapter(_adapterAddr).stakingToken()).balanceOf(
                address(this)
            );

            (to, value, callData) = IAdapterManager(_adapterManager)
                .getWithdrawCallData(_adapterAddr, _amount);
            (success, ) = to.call{value: value}(callData);
            require(success, "Error: Devest internal issue");

            aAmt = IBEP20(IAdapter(_adapterAddr).stakingToken()).balanceOf(
                address(this)
            );
            require(aAmt - bAmt == _amount, "Error: Devest failed");

            IBEP20(IAdapter(_adapterAddr).stakingToken()).approve(
                IAdapterManager(_adapterManager).getAdapterStrat(_adapterAddr),
                _amount
            );

            (to, value, callData) = IAdapterManager(_adapterManager)
                .getDeLoanCallData(_adapterAddr, _amount);
            (success, ) = to.call{value: value}(callData);
            require(success, "Error: DeLoan internal issue");
        }

        _amount = IAdapter(_adapterAddr).stackWithdrawalAmounts(
            _account,
            _tokenId,
            0
        );

        bAmt = IBEP20(IAdapter(_adapterAddr).stakingToken()).balanceOf(
            address(this)
        );
        (to, value, callData) = IAdapterManager(_adapterManager)
            .getWithdrawCallData(_adapterAddr, (_amount * 9999) / 10000);
        (success, ) = to.call{value: value}(callData);
        require(success, "Error: Devest internal issue");

        aAmt = IBEP20(IAdapter(_adapterAddr).stakingToken()).balanceOf(
            address(this)
        );

        require(bAmt < aAmt, "Error: Devest failed");
    }

    function withdrawLP(
        IYBNFT.Adapter memory _adapter,
        address wbnb,
        uint256 _amountIn
    ) public returns (uint256 amountOut) {
        amountOut = removeLiquidity(
            _adapter,
            IPancakePair(_adapter.token).token0(),
            IPancakePair(_adapter.token).token1(),
            wbnb,
            _amountIn
        );
    }

    function depositToAdapter(
        address _adapterManager,
        address _token,
        address _adapterAddr,
        uint256 _tokenId,
        uint256 _amount,
        address _account,
        HedgepieInvestor.UserAdapterInfo storage _userAdapterInfo,
        HedgepieInvestor.AdapterInfo storage _adapterInfo
    ) public {
        uint256[2] memory amounts;
        address[3] memory addrs;
        addrs[0] = IAdapter(_adapterAddr).stakingToken();
        addrs[1] = IAdapter(_adapterAddr).repayToken();
        addrs[2] = IAdapter(_adapterAddr).rewardToken();

        amounts[0] = addrs[1] != address(0)
            ? IBEP20(addrs[1]).balanceOf(address(this))
            : (
                IAdapter(_adapterAddr).isVault()
                    ? IAdapter(_adapterAddr).pendingShares()
                    : (
                        addrs[2] != address(0)
                            ? IBEP20(addrs[2]).balanceOf(address(this))
                            : 0
                    )
            );

        IBEP20(_token).approve(
            IAdapterManager(_adapterManager).getAdapterStrat(_adapterAddr),
            _amount
        );

        (address to, uint256 value, bytes memory callData) = IAdapterManager(
            _adapterManager
        ).getDepositCallData(_adapterAddr, _amount);

        (bool success, ) = to.call{value: value}(callData);
        require(success, "Error: Deposit internal issue");

        amounts[1] = addrs[1] != address(0)
            ? IBEP20(addrs[1]).balanceOf(address(this))
            : (
                IAdapter(_adapterAddr).isVault()
                    ? IAdapter(_adapterAddr).pendingShares()
                    : (
                        addrs[2] != address(0)
                            ? IBEP20(addrs[2]).balanceOf(address(this))
                            : 0
                    )
            );

        // Venus short leverage
        if (IAdapter(_adapterAddr).isLeverage()) {
            require(amounts[1] > amounts[0], "Error: Supply failed");

            leverageAsset(
                _adapterManager,
                _adapterAddr,
                _tokenId,
                _amount,
                _account,
                _userAdapterInfo,
                _adapterInfo
            );
        } else if (addrs[1] != address(0)) {
            require(amounts[1] > amounts[0], "Error: Deposit failed");
            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                _account,
                _tokenId,
                amounts[1] - amounts[0]
            );
        } else if (IAdapter(_adapterAddr).isVault()) {
            require(amounts[1] > amounts[0], "Error: Deposit failed");

            _userAdapterInfo.userShares += amounts[1] - amounts[0];
            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                _account,
                _tokenId,
                amounts[1] - amounts[0]
            );
        } else if (addrs[2] != address(0)) {
            // Farm Pool
            uint256 rewardAmount = addrs[2] == addrs[0]
                ? amounts[1] + _amount - amounts[0]
                : amounts[1] - amounts[0];

            if (rewardAmount != 0 && _adapterInfo.totalStaked != 0) {
                _adapterInfo.accTokenPerShare +=
                    (rewardAmount * 1e12) /
                    _adapterInfo.totalStaked;
            }

            if (_userAdapterInfo.amount == 0) {
                _userAdapterInfo.userShares = _adapterInfo.accTokenPerShare;
            }

            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                _account,
                _tokenId,
                _amount
            );
        } else {
            IAdapter(_adapterAddr).increaseWithdrawalAmount(
                _account,
                _tokenId,
                _amount
            );
        }
    }

    function depositToAdapterMatic(
        address _adapterManager,
        address _account,
        uint256 _tokenId,
        uint256 _amount,
        IYBNFT.Adapter memory _adapter,
        HedgepieInvestorMatic.UserAdapterInfo storage _userAdapterInfo,
        HedgepieInvestorMatic.AdapterInfo storage _adapterInfo
    ) public {
        uint256[3] memory amounts;
        address[2] memory addrs;
        addrs[0] = IAdapter(_adapter.addr).repayToken();
        addrs[1] = IAdapter(_adapter.addr).rewardToken();
        bool isVault = IAdapter(_adapter.addr).isVault();

        amounts[0] = addrs[0] != address(0)
            ? IBEP20(addrs[0]).balanceOf(address(this))
            : (
                isVault ? IAdapter(_adapter.addr).pendingShares() :
                    addrs[1] != address(0)
                        ? IBEP20(addrs[1]).balanceOf(address(this))
                        : 0
            );
        
        (address to, uint256 value, bytes memory callData) = IAdapterManager(
            _adapterManager
        ).getDepositCallData(_adapter.addr, _amount);

        IBEP20(_adapter.token).approve(
            IAdapterManager(_adapterManager).getAdapterStrat(_adapter.addr),
            _amount
        );
        (bool success,) = to.call{value: value}(callData);
        require(success, "Error: Deposit internal issue");

        amounts[1] = addrs[0] != address(0)
            ? IBEP20(addrs[0]).balanceOf(address(this))
            : (
                isVault ? IAdapter(_adapter.addr).pendingShares() :
                    addrs[1] != address(0)
                        ? IBEP20(addrs[1]).balanceOf(address(this))
                        : 0
            );

        unchecked { amounts[2] = amounts[1] - amounts[0]; }
        if (addrs[1] != address(0)) {
            // Farm Pool
            if(addrs[1] == IAdapter(_adapter.addr).stakingToken()) amounts[2] += _amount;

            if (
                amounts[2] != 0 && 
                _adapterInfo.totalStaked != 0 &&
                addrs[0] == address(0)
            ) {
                unchecked {
                    _adapterInfo.accTokenPerShare +=
                        (amounts[2] * 1e12) /
                        _adapterInfo.totalStaked;
                    _adapterInfo.accTokenPerShare1 +=
                        (amounts[2] * 1e12) /
                        _adapterInfo.totalStaked;    
                }
            }

            if (_userAdapterInfo.amount == 0) {
                _userAdapterInfo.userShares = _adapterInfo.accTokenPerShare;
                _userAdapterInfo.userShares1 = _adapterInfo.accTokenPerShare1;
            }

            amounts[2] = _amount;
        } else if (isVault) {
            require(amounts[2] > 0, "Error: Deposit failed");

            unchecked {
                _userAdapterInfo.userShares += amounts[2];
                _userAdapterInfo.userShares1 += amounts[2];
            }
        } else if (addrs[0] != address(0)) {
            require(amounts[2] > 0, "Error: Deposit failed");
        } else {
            amounts[2] = _amount;
        }

        IAdapter(_adapter.addr).increaseWithdrawalAmount(
            _account,
            _tokenId,
            amounts[2]
        );
    }

    function getLPMatic(
        IYBNFT.Adapter memory _adapter,
        address wbnb,
        address _account,
        uint256 _amountIn,
        uint256 _tokenId
    ) public returns (uint256 amountOut) {
        address[2] memory tokens;
        tokens[0] = IPancakePair(_adapter.token).token0();
        tokens[1] = IPancakePair(_adapter.token).token1();
        bool noDeposit = IAdapter(_adapter.addr).noDeposit();
        address _router = IAdapter(_adapter.addr).router();
        address _strategy = noDeposit ? IAdapter(_adapter.addr).strategy() : _router;

        uint256[2] memory tokenAmount;
        tokenAmount[0] = _amountIn / 2;
        tokenAmount[1] = _amountIn - tokenAmount[0];
        if (tokens[0] != wbnb) {
            tokenAmount[0] = swapOnRouter(
                _adapter.addr,
                tokenAmount[0],
                tokens[0],
                _router,
                wbnb
            );
            IBEP20(tokens[0]).approve(_strategy, tokenAmount[0]);
        }

        if (tokens[1] != wbnb) {
            tokenAmount[1] = swapOnRouter(
                _adapter.addr,
                tokenAmount[1],
                tokens[1],
                _router,
                wbnb
            );
            IBEP20(tokens[1]).approve(_strategy, tokenAmount[1]);
        }

        if(noDeposit) {
            uint256 tokenId = IAdapter(_adapter.addr).getLiquidityToken(_account, _tokenId);

            // wrap to wmatic
            if(tokens[0] == wbnb) {
                IWrap(wbnb).deposit(tokenAmount[0]);
                IBEP20(wbnb).approve(_strategy, tokenAmount[0]);
            } else if(tokens[0] == wbnb) {
                IWrap(wbnb).deposit(tokenAmount[1]);
                IBEP20(wbnb).approve(_strategy, tokenAmount[1]);
            }
            
            if(tokenId != 0) {
                INonfungiblePositionManager.IncreaseLiquidityParams memory params = 
                    INonfungiblePositionManager.IncreaseLiquidityParams({
                        tokenId: tokenId,
                        amount0Desired: tokenAmount[0],
                        amount1Desired: tokenAmount[1],
                        amount0Min: 0,
                        amount1Min: 0,
                        deadline: block.timestamp + 2 hours
                    });

                (amountOut, , ) = INonfungiblePositionManager(_strategy).increaseLiquidity(params);
            } else {
                int24[2] memory ticks;
                (ticks[0], ticks[1]) = IAdapter(_adapter.addr).getTick();
                INonfungiblePositionManager.MintParams memory params =
                    INonfungiblePositionManager.MintParams({
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

                (tokenId, amountOut, , ) = INonfungiblePositionManager(_strategy).mint(params);
                IAdapter(_adapter.addr).setLiquidityToken(_account, _tokenId, tokenId);
            }
        } else if (tokenAmount[0] != 0 && tokenAmount[1] != 0) {
            amountOut = addLiquidity(
                tokens[0],
                tokens[1],
                wbnb,
                _router,
                tokenAmount[0],
                tokenAmount[1]
            );
        }
    }

    function withdrawLPMatic(
        IYBNFT.Adapter memory _adapter,
        address wbnb,
        address _account,
        uint256 _amountIn,
        uint256 _tokenId
    ) public returns (uint256 amountOut) {
        address[2] memory tokens;
        tokens[0] = IPancakePair(_adapter.token).token0();
        tokens[1] = IPancakePair(_adapter.token).token1();

        address _router = IAdapter(_adapter.addr).router();

        if(IAdapter(_adapter.addr).noDeposit()) {
            uint256 tokenId = IAdapter(_adapter.addr).getLiquidityToken(_account, _tokenId);
            require(tokenId != 0, "Invalid request");

            INonfungiblePositionManager.DecreaseLiquidityParams memory params =
                INonfungiblePositionManager.DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: uint128(_amountIn),
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp + 2 hours
                });
            (uint256 amount0, uint256 amount1) = INonfungiblePositionManager(IAdapter(_adapter.addr).strategy()).decreaseLiquidity(params);

            if(amountOut != 0) {
                if(tokens[0] == wbnb) {
                    IWrap(tokens[0]).withdraw(amount0);
                    amountOut += amount0;
                } else {
                    amountOut += swapforCoin(
                        _adapter.addr,
                        amount0, 
                        tokens[0], 
                        _router, 
                        wbnb
                    );
                }
            }

            if(amount1 != 0) {
                if(tokens[1] == wbnb) {
                    IWrap(tokens[1]).withdraw(amount1);
                    amountOut += amount1;
                } else {
                    // amountOut += swapforCoin(_adapter, amount1, token1, _router, wbnb);
                }
            }
        } else {
            amountOut = removeLiquidity(
                _adapter,
                tokens[0],
                tokens[1],
                wbnb,
                _amountIn
            );
        }
    }
    
    function addLiquidity(
        address token0,
        address token1,
        address wbnb,
        address router,
        uint256 token0Amount,
        uint256 token1Amount
    ) public returns(uint256 amountOut) {
        if (token0 == wbnb || token1 == wbnb) {
            (, , amountOut) = IPancakeRouter(router).addLiquidityETH{
                value: token0 == wbnb ? token0Amount : token1Amount
            }(
                token0 == wbnb ? token1 : token0,
                token0 == wbnb ? token1Amount : token0Amount,
                0,
                0,
                address(this),
                block.timestamp + 2 hours
            );
        } else {
            (, , amountOut) = IPancakeRouter(router).addLiquidity(
                token0,
                token1,
                token0Amount,
                token1Amount,
                0,
                0,
                address(this),
                block.timestamp + 2 hours
            );
        }
    }

    function removeLiquidity(
        IYBNFT.Adapter memory _adapter,
        address token0,
        address token1,
        address wbnb,
        uint256 _amountIn
    ) public returns(uint256 amountOut) {
        address _router = IAdapter(_adapter.addr).router();
        IBEP20(_adapter.token).approve(_router, _amountIn);

        if (token0 == wbnb || token1 == wbnb) {
            address tokenAddr = token0 == wbnb ? token1 : token0;
            (uint256 amountToken, uint256 amountETH) = IPancakeRouter(_router)
                .removeLiquidityETH(
                    tokenAddr,
                    _amountIn,
                    0,
                    0,
                    address(this),
                    block.timestamp + 2 hours
                );

            amountOut = amountETH;
            amountOut += swapforCoin(
                _adapter.addr,
                amountToken,
                tokenAddr,
                _router,
                wbnb
            );
        } else {
            (uint256 amountA, uint256 amountB) = IPancakeRouter(_router)
                .removeLiquidity(
                    token0,
                    token1,
                    _amountIn,
                    0,
                    0,
                    address(this),
                    block.timestamp + 2 hours
                );

            amountOut += swapforCoin(_adapter.addr, amountA, token0, _router, wbnb);
            amountOut += swapforCoin(_adapter.addr, amountB, token1, _router, wbnb);
        }
    }
}
