import axios from "axios";

const APY_API_URL = "https://api.yearn.finance/v1/chains/1/vaults/all";

const getYearnAPY = async (strategy: String) => {
    try {
        let { data: apyData } = await axios.get(APY_API_URL);

        if (!apyData) return { apy: 0 };
        apyData = apyData.filter(
            (it) =>
                it.address &&
                String(it.address).toLowerCase() ===
                    String(strategy).toLowerCase()
        );
        if (apyData.length === 0) return { minAPY: 0, maxAPY: 0 };

        return {
            apy: apyData[0].apy.net_apy * 100,
        };
    } catch (err) {
        return { apy: 0 };
    }
};

// getYearnAPY("0xF29AE508698bDeF169B89834F76704C3B205aedf");

export default getYearnAPY;
