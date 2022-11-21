import axios from "axios";

const APY_API_URL = "https://api.pickle.finance/prod/protocol/pfcore";

const getPickleAPY = async (jar: String) => {
    try {
        let { data: apyData } = await axios.get(APY_API_URL);

        if (!apyData) return { minAPY: 0, maxAPY: 0 };
        apyData = apyData.assets.jars
            .filter((it) => it.enablement === "enabled")
            .filter(
                (it) =>
                    it.contract &&
                    String(it.contract).toLowerCase() ===
                        String(jar).toLowerCase()
            );
        if (apyData.length === 0) return { minAPY: 0, maxAPY: 0 };
        return {
            minAPY:
                apyData[0].aprStats.apy +
                apyData[0].farm.details.farmApyComponents[0].apr,
            maxAPY:
                apyData[0].aprStats.apy +
                apyData[0].farm.details.farmApyComponents[0].maxApr,
        };
    } catch (err) {
        return { minAPY: 0, maxAPY: 0 };
    }
};

// getPickleAPY(
//     "0xde74b6c547bd574c3527316a2eE30cd8F6041525",
//     TYPE_ADAPTER.PICKLE_CURVE_GAUGE
// );

export default getPickleAPY;
