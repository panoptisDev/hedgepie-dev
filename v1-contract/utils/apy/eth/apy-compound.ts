import axios from "axios";

const APY_API_URL = "https://a./eth-apympound.finance/api/v2/ctoken";

const getCompoundAPY = async (strategy: String) => {
    try {
        let { data: apyData } = await axios.get(APY_API_URL);
        if (!apyData) return { apy: 0 };

        apyData = apyData.cToken.filter(
            (it) =>
                it.token_address &&
                String(it.token_address).toLowerCase() ===
                    String(strategy).toLowerCase()
        );

        if (apyData.length === 0) return { apy: 0 };

        return {
            apy: apyData[0].comp_supply_apy,
        };
    } catch (err) {
        return { minAPY: 0, maxAPY: 0 };
    }
};

// getCompoundAPY("0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c");

export default getCompoundAPY;
