import axios from "axios";

const APY_API_URL = "https://ape-swap-api.herokuapp.com/stats/network/lpAprs/56";

const getApeswapAPY = async (pid: number) => {
    try {
        let { data: apyData } = await axios.get(APY_API_URL);
        if (!apyData) return { apy: 0 };

        apyData = apyData.lpAprs.filter(
            (it: any) =>
                it.pid &&
                String(it.pid).toLowerCase() ===
                    String(pid).toLowerCase()
        );

        if (!apyData || apyData.length === 0) return { apy: 0 };

        return {
            apy: apyData.lpApr * 365,
        };
    } catch (err) {
        return { minAPY: 0, maxAPY: 0 };
    }
};

// getApeswapAPY(13);

export default getApeswapAPY;
