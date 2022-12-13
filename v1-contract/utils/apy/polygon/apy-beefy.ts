import axios from "axios";

const APY_API_URL = "https://api.beefy.finance/apy";

const getBeefyAPY = async (strategy: string) => {
    try {
        let { data: apyData } = await axios.get(APY_API_URL);
        if (!apyData) return { apy: 0 };

        apyData = apyData[strategy];

        if (!apyData || apyData.length === 0) return { apy: 0 };

        return {
            apy: parseFloat(apyData) / 100,
        };
    } catch (err) {
        return { minAPY: 0, maxAPY: 0 };
    }
};

// getCompoundAPY("quick-shib-matic");

export default getBeefyAPY;
