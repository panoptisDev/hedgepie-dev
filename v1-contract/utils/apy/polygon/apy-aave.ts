import { ethers } from "ethers";
import LendingPoolABI from "../../abis/lendingPoolABI.json";
import BigNumber from "bignumber.js";

const LendingPool = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
const BigNumberEther = ethers.BigNumber;

const getAaveAPY = async (underlyingAsset: String) => {
    try {
        const RAY = BigNumberEther.from(10).pow(27);
        const DAYS_PER_YEAR = 365;
        const provider = new ethers.providers.JsonRpcProvider(
            "https://polygon-rpc.com",
            137
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

getAaveAPY("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");

// export default getAaveAPY;
