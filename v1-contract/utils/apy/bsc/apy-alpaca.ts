import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import BEPABI from "../../abis/IBEP20.json";
import alpacaABI from "../../abis/alpacaABI.json";

const BLOCK_TIME = 3;
const DAY_IN_SECOND = 86400;
const DAYS_PER_YEAR = 365;
const LendingPool = "0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F";
const BigNumberEther = ethers.BigNumber;

const getAlpacaAPY = async (underlyingAsset: string, pid: number) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(
            "https://rpc.ankr.com/bsc",
            56
        );

        const underlyingContract = new ethers.Contract(
            underlyingAsset,
            BEPABI as any,
            provider
        );

        const lendingContract = new ethers.Contract(
            LendingPool,
            alpacaABI as any,
            provider
        );

        const totalStaked = await underlyingContract.balanceOf(LendingPool);

        const [poolInfo, totalAlloc, perBlock] = await Promise.all[
            lendingContract.poolInfo(pid),
            lendingContract.totalAllocPoint(),
            lendingContract.alpacaPerBlock()
        ];

        const poolAlloc = poolInfo.allocPoint;

        const depositAPY =
            BigNumberEther.from(perBlock)
                .mul(BigNumberEther.from(DAY_IN_SECOND * DAYS_PER_YEAR / BLOCK_TIME))
                .mul(BigNumberEther.from(poolAlloc))
                .div(BigNumberEther.from(totalAlloc))
                .div(BigNumberEther.from(totalStaked))
                .toNumber();

        return { apy: depositAPY };
    } catch (err) {
        console.log(err);
        return { apy: 0 };
    }
};

// getAlpacaAPY("0x3282d2a151ca00BfE7ed17Aa16E42880248CD3Cd", 20);

export default getAlpacaAPY;
