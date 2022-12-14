import ethers from "ethers";
import * as AdapterEthABI from "../../../artifacts/contracts/interfaces/IAdapterEth.sol/IAdapterEth.json";

import apyAave from "./apy-aave";
import apyCompound from "./apy-compound";
import apyCurve from "./apy-curve";
import apyPickle from "./apy-pickle";
import apyYearn from "./apy-yearn";

// Parameter type to get APR based on NETWORK_ID and ADAPTER_ADDRESS
interface GET_APR_INFO {
    chainId: number;
    adapterAddr: string;
    adapterType: TYPE_ADAPTER;
}

// Add adapter type if other adapter is added
enum TYPE_ADAPTER {
    AAVE,
    BALANCER,
    COMPOUND,
    CURVE,
    PICKLE,
    SUSHISWAP,
    UNISWAP_V3,
    YEARN,
}

// get rpc node url from chainId
const getRpcUrl = (chainId: number) => {
    if (chainId === 1) return "https://rpc.ankr.com/eth";
    else if (chainId === 56) return "https://rpc.ankr.com/bsc";
    else if (chainId === 137) return "https://polygon-rpc.com";
};

const getAPY = async (adapterInfo: GET_APR_INFO) => {
    const { chainId, adapterAddr, adapterType } = adapterInfo;
    const provider = new ethers.providers.JsonRpcProvider(
        getRpcUrl(chainId),
        chainId
    );
    const ctAdapter = new ethers.Contract(
        adapterAddr,
        AdapterEthABI.abi,
        provider
    );

    if (adapterType === TYPE_ADAPTER.AAVE) {
        return await apyAave(await ctAdapter.stakingToken());
    } else if (adapterType === TYPE_ADAPTER.BALANCER) {
        // code for apr calculation for balancer
    } else if (adapterType === TYPE_ADAPTER.COMPOUND) {
        return await apyCompound(await ctAdapter.strategy());
    } else if (adapterType === TYPE_ADAPTER.CURVE) {
        return await apyCurve(await ctAdapter.strategy());
    } else if (adapterType === TYPE_ADAPTER.PICKLE) {
        return await apyPickle(await ctAdapter.jar());
    } else if (adapterType === TYPE_ADAPTER.SUSHISWAP) {
        // code for apr calculation for sushiswap
    } else if (adapterType === TYPE_ADAPTER.UNISWAP_V3) {
        // code for apr calculation for uniswap_v3
    } else if (adapterType === TYPE_ADAPTER.YEARN) {
        return await apyYearn(await ctAdapter.strategy());
    }
};

export { getAPY, TYPE_ADAPTER };
