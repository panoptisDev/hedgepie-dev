// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/*
  ___                      _   _
 | _ )_  _ _ _  _ _ _  _  | | | |
 | _ \ || | ' \| ' \ || | |_| |_|
 |___/\_,_|_||_|_||_\_, | (_) (_)
                    |__/

*
* MIT License
* ===========
*
* Copyright (c) 2020 BunnyFinance
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
*/

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/IBEP20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./SafeDecimal.sol";
import "../interfaces/IPriceCalculator.sol";
import "../interfaces/IVenusDistribution.sol";
import "../interfaces/IVenusPriceOracle.sol";
import "../interfaces/IVToken.sol";
import "../interfaces/IVaultVenusBridge.sol";

import "../vaults/venus/VaultVenus.sol";

contract SafeVenus is OwnableUpgradeable {
    using SafeMath for uint256;
    using SafeDecimal for uint256;

    IPriceCalculator private constant PRICE_CALCULATOR =
        IPriceCalculator(0xF5BF8A9249e3cc4cB684E3f23db9669323d4FB7d);
    IVenusDistribution private constant VENUS_UNITROLLER =
        IVenusDistribution(0xfD36E2c2a6789Db23113685031d7F16329158384);

    address private constant XVS = 0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63;
    uint256 private constant BLOCK_PER_DAY = 28800;

    /* ========== INITIALIZER ========== */

    function initialize() external initializer {
        __Ownable_init();
    }

    function valueOfUnderlying(IVToken vToken, uint256 amount)
        internal
        view
        returns (uint256)
    {
        IVenusPriceOracle venusOracle = IVenusPriceOracle(
            VENUS_UNITROLLER.oracle()
        );
        return venusOracle.getUnderlyingPrice(vToken).mul(amount).div(1e18);
    }

    /* ========== safeMintAmount ========== */

    function safeMintAmount(address payable vault)
        public
        view
        returns (uint256 mintable, uint256 mintableInUSD)
    {
        VaultVenus vaultVenus = VaultVenus(vault);
        mintable = vaultVenus.balanceAvailable().sub(
            vaultVenus.balanceReserved()
        );
        mintableInUSD = valueOfUnderlying(vaultVenus.vToken(), mintable);
    }

    /* ========== safeBorrowAndRedeemAmount ========== */

    function safeBorrowAndRedeemAmount(address payable vault)
        public
        returns (uint256 borrowable, uint256 redeemable)
    {
        VaultVenus vaultVenus = VaultVenus(vault);
        uint256 collateralRatioLimit = vaultVenus.collateralRatioLimit();

        (, uint256 accountLiquidityInUSD, ) = VENUS_UNITROLLER
            .getAccountLiquidity(address(vaultVenus.venusBridge()));
        uint256 stakingTokenPriceInUSD = valueOfUnderlying(
            vaultVenus.vToken(),
            1e18
        );
        uint256 safeLiquidity = accountLiquidityInUSD
            .mul(1e18)
            .div(stakingTokenPriceInUSD)
            .mul(990)
            .div(1000);

        (uint256 accountBorrow, uint256 accountSupply) = venusBorrowAndSupply(
            vault
        );
        uint256 supplyFactor = collateralRatioLimit.mul(accountSupply).div(
            1e18
        );
        uint256 borrowAmount = supplyFactor > accountBorrow
            ? supplyFactor.sub(accountBorrow).mul(1e18).div(
                uint256(1e18).sub(collateralRatioLimit)
            )
            : 0;
        uint256 redeemAmount = accountBorrow > supplyFactor
            ? accountBorrow.sub(supplyFactor).mul(1e18).div(
                uint256(1e18).sub(collateralRatioLimit)
            )
            : uint256(1);
        return (
            Math.min(borrowAmount, safeLiquidity),
            Math.min(redeemAmount, safeLiquidity)
        );
    }

    function safeBorrowAmount(address payable vault)
        public
        returns (uint256 borrowable)
    {
        VaultVenus vaultVenus = VaultVenus(vault);
        IVToken vToken = vaultVenus.vToken();
        uint256 collateralRatioLimit = vaultVenus.collateralRatioLimit();
        uint256 stakingTokenPriceInUSD = valueOfUnderlying(vToken, 1e18);

        (, uint256 accountLiquidityInUSD, ) = VENUS_UNITROLLER
            .getAccountLiquidity(address(vaultVenus.venusBridge()));
        uint256 accountLiquidity = accountLiquidityInUSD.mul(1e18).div(
            stakingTokenPriceInUSD
        );
        uint256 marketSupply = vToken
            .totalSupply()
            .mul(vToken.exchangeRateCurrent())
            .div(1e18);
        uint256 marketLiquidity = marketSupply > vToken.totalBorrowsCurrent()
            ? marketSupply.sub(vToken.totalBorrowsCurrent())
            : 0;
        uint256 safeLiquidity = Math
            .min(marketLiquidity, accountLiquidity)
            .mul(990)
            .div(1000);

        (uint256 accountBorrow, uint256 accountSupply) = venusBorrowAndSupply(
            vault
        );
        uint256 supplyFactor = collateralRatioLimit.mul(accountSupply).div(
            1e18
        );
        uint256 borrowAmount = supplyFactor > accountBorrow
            ? supplyFactor.sub(accountBorrow).mul(1e18).div(
                uint256(1e18).sub(collateralRatioLimit)
            )
            : 0;
        return Math.min(borrowAmount, safeLiquidity);
    }

    function safeRedeemAmount(address payable vault)
        public
        returns (uint256 redeemable)
    {
        VaultVenus vaultVenus = VaultVenus(vault);
        IVToken vToken = vaultVenus.vToken();

        (, uint256 collateralFactorMantissa, ) = VENUS_UNITROLLER.markets(
            address(vToken)
        );
        uint256 collateralRatioLimit = collateralFactorMantissa
            .mul(vaultVenus.collateralRatioFactor())
            .div(1000);
        uint256 stakingTokenPriceInUSD = valueOfUnderlying(vToken, 1e18);

        (, uint256 accountLiquidityInUSD, ) = VENUS_UNITROLLER
            .getAccountLiquidity(address(vaultVenus.venusBridge()));
        uint256 accountLiquidity = accountLiquidityInUSD.mul(1e18).div(
            stakingTokenPriceInUSD
        );
        uint256 marketSupply = vToken
            .totalSupply()
            .mul(vToken.exchangeRateCurrent())
            .div(1e18);
        uint256 marketLiquidity = marketSupply > vToken.totalBorrowsCurrent()
            ? marketSupply.sub(vToken.totalBorrowsCurrent())
            : 0;
        uint256 safeLiquidity = Math
            .min(marketLiquidity, accountLiquidity)
            .mul(990)
            .div(1000);

        (uint256 accountBorrow, uint256 accountSupply) = venusBorrowAndSupply(
            vault
        );
        uint256 supplyFactor = collateralRatioLimit.mul(accountSupply).div(
            1e18
        );
        uint256 redeemAmount = accountBorrow > supplyFactor
            ? accountBorrow.sub(supplyFactor).mul(1e18).div(
                uint256(1e18).sub(collateralRatioLimit)
            )
            : uint256(1);
        return Math.min(redeemAmount, safeLiquidity);
    }

    function venusBorrowAndSupply(address payable vault)
        public
        returns (uint256 borrow, uint256 supply)
    {
        VaultVenus vaultVenus = VaultVenus(vault);
        borrow = vaultVenus.vToken().borrowBalanceCurrent(
            address(vaultVenus.venusBridge())
        );
        supply = IVaultVenusBridge(vaultVenus.venusBridge())
            .balanceOfUnderlying(vault);
    }

    /* ========== safeCompoundDepth ========== */

    function safeCompoundDepth(address payable vault) public returns (uint256) {
        VaultVenus vaultVenus = VaultVenus(vault);
        IVToken vToken = vaultVenus.vToken();
        address stakingToken = vaultVenus.stakingToken();

        (uint256 apyBorrow, bool borrowWithDebt) = _venusAPYBorrow(
            vToken,
            stakingToken
        );
        return
            borrowWithDebt &&
                _venusAPYSupply(vToken, stakingToken) <= apyBorrow + 2e15
                ? 0
                : vaultVenus.collateralDepth();
    }

    function _venusAPYBorrow(IVToken vToken, address stakingToken)
        private
        returns (uint256 apy, bool borrowWithDebt)
    {
        (, uint256 xvsValueInUSD) = PRICE_CALCULATOR.valueOfAsset(
            XVS,
            VENUS_UNITROLLER.venusSpeeds(address(vToken)).mul(BLOCK_PER_DAY)
        );
        (, uint256 borrowValueInUSD) = PRICE_CALCULATOR.valueOfAsset(
            stakingToken,
            vToken.totalBorrowsCurrent()
        );

        uint256 apyBorrow = vToken
            .borrowRatePerBlock()
            .mul(BLOCK_PER_DAY)
            .add(1e18)
            .power(365)
            .sub(1e18);
        uint256 apyBorrowXVS = xvsValueInUSD
            .mul(1e18)
            .div(borrowValueInUSD)
            .add(1e18)
            .power(365)
            .sub(1e18);
        apy = apyBorrow > apyBorrowXVS
            ? apyBorrow.sub(apyBorrowXVS)
            : apyBorrowXVS.sub(apyBorrow);
        borrowWithDebt = apyBorrow > apyBorrowXVS;
    }

    function _venusAPYSupply(IVToken vToken, address stakingToken)
        private
        returns (uint256 apy)
    {
        (, uint256 xvsValueInUSD) = PRICE_CALCULATOR.valueOfAsset(
            XVS,
            VENUS_UNITROLLER.venusSpeeds(address(vToken)).mul(BLOCK_PER_DAY)
        );
        (, uint256 supplyValueInUSD) = PRICE_CALCULATOR.valueOfAsset(
            stakingToken,
            vToken.totalSupply().mul(vToken.exchangeRateCurrent()).div(1e18)
        );

        uint256 apySupply = vToken
            .supplyRatePerBlock()
            .mul(BLOCK_PER_DAY)
            .add(1e18)
            .power(365)
            .sub(1e18);
        uint256 apySupplyXVS = xvsValueInUSD
            .mul(1e18)
            .div(supplyValueInUSD)
            .add(1e18)
            .power(365)
            .sub(1e18);
        apy = apySupply.add(apySupplyXVS);
    }
}
