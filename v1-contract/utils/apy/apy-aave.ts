import { ethers } from "ethers";
import LendingPoolABI from "../abis/lendingPoolABI.json";
import BigNumber from "bignumber.js";

const LendingPool = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
const BigNumberEther = ethers.BigNumber;

const getAaveAPY = async (underlyingAsset: String) => {
    try {
        const RAY = BigNumberEther.from(10).pow(27);
        const DAYS_PER_YEAR = 365;
        const provider = new ethers.providers.JsonRpcProvider(
            "https://rpc.ankr.com/eth",
            1
        );

        const lendingContract = new ethers.Contract(
            LendingPool,
            LendingPoolABI as any,
            provider
        );
        const liquidityRate = (
            await lendingContract.getReserveData(underlyingAsset)
        ).currentLiquidityRate;
        const depositAPR =
            BigNumberEther.from(liquidityRate)
                .mul(BigNumberEther.from(10).pow(10))
                .div(RAY)
                .toNumber() / 1e10;
        const depositAPY = new BigNumber(1 + depositAPR / DAYS_PER_YEAR)
            .pow(DAYS_PER_YEAR)
            .minus(1);

        return { apy: depositAPY.toNumber };
    } catch (err) {
        console.log(err);
        return { apy: 0 };
    }
};

// getAaveAPY("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");

export default getAaveAPY;
