import { BigNumber, ethers } from "ethers";

import BEPABI from "../../abis/IBEP20.json";
import beltABI from "../../abis/beltABI.json";

const BeltStrategy = "0x9171Bf7c050aC8B4cf7835e51F7b4841DFB2cCD0";
const BigNumberEther = ethers.BigNumber;

const getBeltAPY = async (underlyingAsset: string) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(
            "https://rpc.ankr.com/bsc",
            56
        );

        const beltContract = new ethers.Contract(
            BeltStrategy,
            beltABI as any,
            provider
        );

        const [strategyCnt, calcPoolValue, totalSupply] = await Promise.all[
            beltContract.strategyCount(),
            beltContract.calcPoolValueInToken(),
            beltContract.totalSupply()
        ];
        if(Number(strategyCnt) > 0) {
            let sumPoolValue: BigNumber = BigNumber.from(0);
            let sumTotalSupply: BigNumber = BigNumber.from(0);
            for(let i = 0; i < Number(strategyCnt); i++) {
                const strategyAddr = await beltContract.strategies(i);
                const strategyContract = new ethers.Contract(
                    strategyAddr,
                    beltABI as any,
                    provider
                );
                
                const [strategyPoolValue, strategyTotalSupply] = await Promise.all([
                    strategyContract.calcPoolValueInToken(),
                    strategyContract.totalSupply()
                ]);

                sumPoolValue = sumPoolValue.add(BigNumber.from(strategyPoolValue));
                sumTotalSupply = sumTotalSupply.add(BigNumber.from(strategyTotalSupply));
            }

            const depositAPY = sumTotalSupply
                .mul(totalSupply)
                .div(sumPoolValue)
                .div(calcPoolValue)
                .toNumber();

            return { apy: depositAPY };
        } else {
            return { apy: 0 };
        }
    } catch (err) {
        console.log(err);
        return { apy: 0 };
    }
};

// getBeltAPY("0x3282d2a151ca00BfE7ed17Aa16E42880248CD3Cd");

export default getBeltAPY;
