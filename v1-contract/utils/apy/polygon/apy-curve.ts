import curve from "@curvefi/api";

const getCurveAPY = async (strategy: String) => {
    try {
        await curve.init(
            "JsonRpc",
            { url: "https://polygon-rpc.com" },
            { gasPrice: 0, maxFeePerGas: 0, maxPriorityFeePerGas: 0 }
        );
        await curve.fetchFactoryPools();
        await curve.fetchCryptoFactoryPools();

        const poolNames = [
            ...curve.getPoolList(),
            ...curve.getFactoryPoolList(),
            ...curve.getCryptoFactoryPoolList(),
        ];

        let pool: any = null;
        for (let i = 0; i < poolNames.length; i++) {
            const tmpPool = curve.getPool(poolNames[i]);
            if (
                String(tmpPool.gauge).toLowerCase() ===
                String(strategy).toLowerCase()
            ) {
                pool = tmpPool;
                break;
            }
        }

        const baseAPY = await pool.stats.baseApy();
        // { day: '3.1587592896017647', week: '2.6522145719060752' } (as %)

        const tokenAPY = await pool.stats.tokenApy();
        // [ '0.5918', '1.4796' ] (as %)

        return {
            dayApy: Number(baseAPY.day) + Number(tokenAPY[0]),
            weekApy: Number(baseAPY.week) + Number(tokenAPY[1]),
        };
    } catch (err) {
        console.log(err);
        return { dayApy: 0, weekApy: 0 };
    }
};

// getCurveAPY("0x19793B454D3AfC7b454F206Ffe95aDE26cA6912c");

export default getCurveAPY;
