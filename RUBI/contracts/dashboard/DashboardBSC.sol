// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

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

import "@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../interfaces/IStrategy.sol";
import "../interfaces/IRubiMinter.sol";
import "../interfaces/IRubiChef.sol";
import "../interfaces/IPriceCalculator.sol";

import "../vaults/venus/VaultVenus.sol";
import "../vaults/relay/VaultRelayer.sol";
import {RubiPool} from "../vaults/RubiPool.sol";

contract DashboardBSC is OwnableUpgradeable {
    using SafeMath for uint256;
    using SafeDecimal for uint256;

    IPriceCalculator public constant priceCalculator =
        IPriceCalculator(0xF5BF8A9249e3cc4cB684E3f23db9669323d4FB7d);

    address public constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address public constant RUBI = 0xC9849E6fdB743d08fAeE3E34dd2D1bc69EA11a51;
    address public constant CAKE = 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82;
    address public constant VaultCakeToCake =
        0xEDfcB78e73f7bA6aD2D829bf5D462a0924da28eD;

    IRubiChef private constant rubiChef =
        IRubiChef(0x40e31876c4322bd033BAb028474665B12c4d04CE);
    RubiPool private constant rubiPool =
        RubiPool(0xCADc8CB26c8C7cB46500E61171b5F27e9bd7889D);
    VaultRelayer private constant relayer =
        VaultRelayer(payable(0x34D3fF7f0476B38f990e9b8571aCAE60f6321C03));

    /* ========== STATE VARIABLES ========== */

    mapping(address => PoolConstant.PoolTypes) public poolTypes;
    mapping(address => uint256) public pancakePoolIds;
    mapping(address => bool) public perfExemptions;

    /* ========== INITIALIZER ========== */

    function initialize() external initializer {
        __Ownable_init();
    }

    /* ========== Restricted Operation ========== */

    function setPoolType(address pool, PoolConstant.PoolTypes poolType)
        public
        onlyOwner
    {
        poolTypes[pool] = poolType;
    }

    function setPancakePoolId(address pool, uint256 pid) public onlyOwner {
        pancakePoolIds[pool] = pid;
    }

    function setPerfExemption(address pool, bool exemption) public onlyOwner {
        perfExemptions[pool] = exemption;
    }

    /* ========== View Functions ========== */

    function poolTypeOf(address pool)
        public
        view
        returns (PoolConstant.PoolTypes)
    {
        return poolTypes[pool];
    }

    /* ========== Utilization Calculation ========== */

    function utilizationOfPool(address pool)
        public
        view
        returns (uint256 liquidity, uint256 utilized)
    {
        if (poolTypes[pool] == PoolConstant.PoolTypes.Venus) {
            return VaultVenus(payable(pool)).getUtilizationInfo();
        }
        return (0, 0);
    }

    /* ========== Profit Calculation ========== */

    function calculateProfit(address pool, address account)
        public
        view
        returns (uint256 profit, uint256 profitInBNB)
    {
        PoolConstant.PoolTypes poolType = poolTypes[pool];
        profit = 0;
        profitInBNB = 0;

        if (poolType == PoolConstant.PoolTypes.RubiStake_deprecated) {
            // profit as bnb
            (profit, ) = priceCalculator.valueOfAsset(
                address(rubiPool.rewardsToken()),
                rubiPool.earned(account)
            );
            profitInBNB = profit;
        } else if (poolType == PoolConstant.PoolTypes.Rubi) {
            // profit as rubi
            profit = rubiChef.pendingRubi(pool, account);
            (profitInBNB, ) = priceCalculator.valueOfAsset(RUBI, profit);
        } else if (
            poolType == PoolConstant.PoolTypes.CakeStake ||
            poolType == PoolConstant.PoolTypes.FlipToFlip ||
            poolType == PoolConstant.PoolTypes.Venus ||
            poolType == PoolConstant.PoolTypes.RubiToRubi
        ) {
            // profit as underlying
            IStrategy strategy = IStrategy(pool);
            profit = strategy.earned(account);
            (profitInBNB, ) = priceCalculator.valueOfAsset(
                strategy.stakingToken(),
                profit
            );
        } else if (
            poolType == PoolConstant.PoolTypes.FlipToCake ||
            poolType == PoolConstant.PoolTypes.RubiBNB
        ) {
            // profit as cake
            IStrategy strategy = IStrategy(pool);
            profit = strategy
                .earned(account)
                .mul(IStrategy(strategy.rewardsToken()).priceShare())
                .div(1e18);
            (profitInBNB, ) = priceCalculator.valueOfAsset(CAKE, profit);
        }
    }

    function profitOfPool(address pool, address account)
        public
        view
        returns (uint256 profit, uint256 rubi)
    {
        (uint256 profitCalculated, uint256 profitInBNB) = calculateProfit(
            pool,
            account
        );
        profit = profitCalculated;
        rubi = 0;

        if (!perfExemptions[pool]) {
            IStrategy strategy = IStrategy(pool);
            if (strategy.minter() != address(0)) {
                profit = profit.mul(70).div(100);
                rubi = IRubiMinter(strategy.minter()).amountRubiToMint(
                    profitInBNB.mul(30).div(100)
                );
            }

            if (strategy.rubiChef() != address(0)) {
                rubi = rubi.add(rubiChef.pendingRubi(pool, account));
            }
        }
    }

    /* ========== TVL Calculation ========== */

    function tvlOfPool(address pool) public view returns (uint256 tvl) {
        if (poolTypes[pool] == PoolConstant.PoolTypes.RubiStake_deprecated) {
            (, tvl) = priceCalculator.valueOfAsset(
                address(rubiPool.stakingToken()),
                rubiPool.balance()
            );
        } else {
            IStrategy strategy = IStrategy(pool);
            (, tvl) = priceCalculator.valueOfAsset(
                strategy.stakingToken(),
                strategy.balance()
            );

            if (strategy.rewardsToken() == VaultCakeToCake) {
                IStrategy rewardsToken = IStrategy(strategy.rewardsToken());
                uint256 rewardsInCake = rewardsToken
                    .balanceOf(pool)
                    .mul(rewardsToken.priceShare())
                    .div(1e18);
                (, uint256 rewardsInUSD) = priceCalculator.valueOfAsset(
                    address(CAKE),
                    rewardsInCake
                );
                tvl = tvl.add(rewardsInUSD);
            }
        }
    }

    /* ========== Pool Information ========== */

    function infoOfPool(address pool, address account)
        public
        view
        returns (PoolConstant.PoolInfo memory)
    {
        PoolConstant.PoolInfo memory poolInfo;

        IStrategy strategy = IStrategy(pool);
        (uint256 pBASE, uint256 pRUBI) = profitOfPool(pool, account);
        (uint256 liquidity, uint256 utilized) = utilizationOfPool(pool);

        poolInfo.pool = pool;
        poolInfo.balance = strategy.balanceOf(account);
        poolInfo.principal = strategy.principalOf(account);
        poolInfo.available = strategy.withdrawableBalanceOf(account);
        poolInfo.tvl = tvlOfPool(pool);
        poolInfo.utilized = utilized;
        poolInfo.liquidity = liquidity;
        poolInfo.pBASE = pBASE;
        poolInfo.pRUBI = pRUBI;

        PoolConstant.PoolTypes poolType = poolTypeOf(pool);
        if (
            poolType != PoolConstant.PoolTypes.RubiStake_deprecated &&
            strategy.minter() != address(0)
        ) {
            IRubiMinter minter = IRubiMinter(strategy.minter());
            poolInfo.depositedAt = strategy.depositedAt(account);
            poolInfo.feeDuration = minter.WITHDRAWAL_FEE_FREE_PERIOD();
            poolInfo.feePercentage = minter.WITHDRAWAL_FEE();
        }

        poolInfo.portfolio = portfolioOfPoolInUSD(pool, account);
        return poolInfo;
    }

    function poolsOf(address account, address[] memory pools)
        public
        view
        returns (PoolConstant.PoolInfo[] memory)
    {
        PoolConstant.PoolInfo[] memory results = new PoolConstant.PoolInfo[](
            pools.length
        );
        for (uint256 i = 0; i < pools.length; i++) {
            results[i] = infoOfPool(pools[i], account);
        }
        return results;
    }

    /* ========== Relay Information ========== */

    function infoOfRelay(address pool, address account)
        public
        view
        returns (PoolConstant.RelayInfo memory)
    {
        PoolConstant.RelayInfo memory relayInfo;
        relayInfo.pool = pool;
        relayInfo.balanceInUSD = relayer.balanceInUSD(pool, account);
        relayInfo.debtInUSD = relayer.debtInUSD(pool, account);
        relayInfo.earnedInUSD = relayer.earnedInUSD(pool, account);
        return relayInfo;
    }

    function relaysOf(address account, address[] memory pools)
        public
        view
        returns (PoolConstant.RelayInfo[] memory)
    {
        PoolConstant.RelayInfo[] memory results = new PoolConstant.RelayInfo[](
            pools.length
        );
        for (uint256 i = 0; i < pools.length; i++) {
            results[i] = infoOfRelay(pools[i], account);
        }
        return results;
    }

    /* ========== Portfolio Calculation ========== */

    function stakingTokenValueInUSD(address pool, address account)
        internal
        view
        returns (uint256 tokenInUSD)
    {
        PoolConstant.PoolTypes poolType = poolTypes[pool];

        address stakingToken;
        if (poolType == PoolConstant.PoolTypes.RubiStake_deprecated) {
            stakingToken = RUBI;
        } else {
            stakingToken = IStrategy(pool).stakingToken();
        }

        if (stakingToken == address(0)) return 0;
        (, tokenInUSD) = priceCalculator.valueOfAsset(
            stakingToken,
            IStrategy(pool).principalOf(account)
        );
    }

    function portfolioOfPoolInUSD(address pool, address account)
        internal
        view
        returns (uint256)
    {
        uint256 tokenInUSD = stakingTokenValueInUSD(pool, account);
        (, uint256 profitInBNB) = calculateProfit(pool, account);
        uint256 profitInRUBI = 0;

        if (!perfExemptions[pool]) {
            IStrategy strategy = IStrategy(pool);
            if (strategy.minter() != address(0)) {
                profitInBNB = profitInBNB.mul(70).div(100);
                profitInRUBI = IRubiMinter(strategy.minter()).amountRubiToMint(
                    profitInBNB.mul(30).div(100)
                );
            }

            if (
                (poolTypes[pool] == PoolConstant.PoolTypes.Rubi ||
                    poolTypes[pool] == PoolConstant.PoolTypes.RubiBNB ||
                    poolTypes[pool] == PoolConstant.PoolTypes.FlipToFlip) &&
                strategy.rubiChef() != address(0)
            ) {
                profitInRUBI = profitInRUBI.add(
                    rubiChef.pendingRubi(pool, account)
                );
            }
        }

        (, uint256 profitBNBInUSD) = priceCalculator.valueOfAsset(
            WBNB,
            profitInBNB
        );
        (, uint256 profitRUBIInUSD) = priceCalculator.valueOfAsset(
            RUBI,
            profitInRUBI
        );
        return tokenInUSD.add(profitBNBInUSD).add(profitRUBIInUSD);
    }

    function portfolioOf(address account, address[] memory pools)
        public
        view
        returns (uint256 deposits)
    {
        deposits = 0;
        for (uint256 i = 0; i < pools.length; i++) {
            deposits = deposits.add(portfolioOfPoolInUSD(pools[i], account));
        }
    }
}
