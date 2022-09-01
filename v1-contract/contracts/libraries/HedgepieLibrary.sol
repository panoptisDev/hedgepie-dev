// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../libraries/SafeBEP20.sol";
import "../libraries/Ownable.sol";

import "../interfaces/IYBNFT.sol";
import "../interfaces/IAdapter.sol";
import "../interfaces/IVaultStrategy.sol";
import "../interfaces/IAdapterManager.sol";
import "../interfaces/IPancakePair.sol";
import "../interfaces/IPancakeRouter.sol";

import "../HedgepieInvestor.sol";

library HedgepieLibrary {
    function getRewards(
        HedgepieInvestor.AdapterInfo memory _adapter,
        HedgepieInvestor.UserAdapterInfo memory _userAdapterInfo,
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

    function getPaths(
        address _adapter,
        address _inToken,
        address _outToken
    ) public view returns (address[] memory path) {
        return IAdapter(_adapter).getPaths(_inToken, _outToken);
    }

    function swapOnPKS(
        address _adapter,
        uint256 _amountIn,
        address _inToken,
        address _outToken,
        address _swapRouter
    ) public returns (uint256 amountOut) {
        IBEP20(_inToken).approve(_swapRouter, _amountIn);
        address[] memory path = getPaths(_adapter, _inToken, _outToken);
        uint256[] memory amounts = IPancakeRouter(_swapRouter)
            .swapExactTokensForTokens(
                _amountIn,
                0,
                path,
                address(this),
                block.timestamp + 2 hours
            );

        amountOut = amounts[amounts.length - 1];
    }

    function swapOnRouterBNB(
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

    function swapforBNB(
        address _adapter,
        uint256 _amountIn,
        address _inToken,
        address _router,
        address wbnb
    ) public returns (uint256 amountOut) {
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

    function getLPBNB(
        address _adapter,
        uint256 _amountIn,
        address _pairToken,
        address _router,
        address wbnb
    ) public returns (uint256 amountOut) {
        address token0 = IPancakePair(_pairToken).token0();
        address token1 = IPancakePair(_pairToken).token1();

        uint256 token0Amount = _amountIn / 2;
        uint256 token1Amount = _amountIn / 2;
        if (token0 != wbnb) {
            token0Amount = swapOnRouterBNB(
                _adapter,
                token0Amount,
                token0,
                _router,
                wbnb
            );
            IBEP20(token0).approve(_router, token0Amount);
        }

        if (token1 != wbnb) {
            token1Amount = swapOnRouterBNB(
                _adapter,
                token1Amount,
                token1,
                _router,
                wbnb
            );
            IBEP20(token1).approve(_router, token1Amount);
        }

        if (token0Amount != 0 && token1Amount != 0) {
            if (token0 == wbnb || token1 == wbnb) {
                (, , amountOut) = IPancakeRouter(_router).addLiquidityETH{
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
                (, , amountOut) = IPancakeRouter(_router).addLiquidity(
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
        if (!IAdapter(_adapterAddr).isEntered()) {
            (
                address to,
                uint256 value,
                bytes memory callData
            ) = IAdapterManager(_adapterManager).getEnterMarketCallData(
                    _adapterAddr
                );

            (bool success, ) = to.call{value: value}(callData);
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

        uint256[2] memory amounts;
        uint256 value;
        address to;
        bool success;
        bytes memory callData;

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

    function withdrawLPBNB(
        address _adapter,
        uint256 _amountIn,
        address _pairToken,
        address _router,
        address wbnb
    ) public returns (uint256 amountOut) {
        address token0 = IPancakePair(_pairToken).token0();
        address token1 = IPancakePair(_pairToken).token1();

        IBEP20(_pairToken).approve(_router, _amountIn);

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
            amountOut += swapforBNB(
                _adapter,
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

            amountOut += swapforBNB(_adapter, amountA, token0, _router, wbnb);
            amountOut += swapforBNB(_adapter, amountB, token1, _router, wbnb);
        }
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
        } else {
            if (addrs[1] != address(0)) {
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
    }
}
