import ethers from "ethers";
import AdapterEthABI from "../artifacts/contracts/interfaces/IAdapterEth.sol/IAdapterEth.json";

// Parameter type to get APR based on NETWORK_ID and ADAPTER_ADDRESS
interface GET_APR_INFO {
    chainId: number;
    adapterAddr: string;
}

// Add adapter type if other adapter is added
enum TYPE_ADAPTER {
    AAVE_LEND,
    BALANCER_NON_WETH,
    BALANCER_WETH,
    COMPOUND_LEND,
    CURVE_2LP,
    CURVE_3LP,
    CURVE_4LP,
    PICKLE_CURVE_GAUGE,
    PICKLE_SINGLE_GAUGE,
    PICKLE_SUSHI_GAUGE,
    PICKLE_SUSHI_MASTER,
    SUSHISWAP_FARM,
    SUSHISWAP_FARM_V2,
    UNISWAP_V3,
    YEARN_CURVE_VAULT,
    YEARN_SINGLE_VAULT,
}

// strategy address for each adapters
const STRATEGIES = {
    0: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    1: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    2: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    3: "0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c",
    4: "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575",
    5: "0xBC89cd85491d81C6AD2954E6d0362Ee29fCa8F53",
    6: "0xC5cfaDA84E902aD92DD40194f0883ad49639b023",
    7: "0x4801154c499C37cFb524cdb617995331fF618c4E",
    8: "0x06A566E7812413bc66215b48D6F26321Ddf653A9",
    9: "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
    10: "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d",
    11: "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd",
    12: "0xef0881ec094552b2e128cf945ef17a6752b4ec5d",
    13: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    14: "0x1635b506a88fBF428465Ad65d00e8d6B6E5846C3",
    15: "0xF29AE508698bDeF169B89834F76704C3B205aedf",
};

// get rpc node url from chainId
const getRpcUrl = (chainId: number) => {
    if (chainId === 1) return "https://rpc.ankr.com/eth";
    else if (chainId === 56) return "https://rpc.ankr.com/bsc";
    else if (chainId === 137) return "https://polygon-rpc.com";
};

// get adapter type, return value is TYPE_ADAPTER
const getAdapterType: (
    chainId: number,
    adapterAddr: string
) => Promise<TYPE_ADAPTER> = async (chainId: number, adapterAddr: string) => {
    const provider = new ethers.providers.JsonRpcProvider(
        getRpcUrl(chainId),
        chainId
    );
    const ctAdapter = new ethers.Contract(
        adapterAddr,
        AdapterEthABI as any,
        provider
    );
    const strategyAddr = await ctAdapter.strategy();
    let typeIndex = -1;

    Object.keys(STRATEGIES).map((it) => {
        if (
            String(STRATEGIES[it]).toLowerCase() ===
            String(strategyAddr).toLowerCase()
        )
            typeIndex = Number(it);
    });

    return typeIndex as TYPE_ADAPTER;
};

const getAPR = async (adapterInfo: GET_APR_INFO) => {
    const { chainId, adapterAddr } = adapterInfo;

    const adapterType: TYPE_ADAPTER = await getAdapterType(
        chainId,
        adapterAddr
    );

    if (adapterType === TYPE_ADAPTER.AAVE_LEND) {
        // code for apr calculation for aave
    } else if (adapterType === TYPE_ADAPTER.BALANCER_NON_WETH) {
        // code for apr calculation for balancer_non_weth
    } else if (adapterType === TYPE_ADAPTER.BALANCER_WETH) {
        // code for apr calculation for balancer_weth
    } else if (adapterType === TYPE_ADAPTER.COMPOUND_LEND) {
        // code for apr calculation for compound_lend
    } else if (adapterType === TYPE_ADAPTER.CURVE_2LP) {
        // code for apr calculation for curve_2lp
    } else if (adapterType === TYPE_ADAPTER.CURVE_3LP) {
        // code for apr calculation for curve_3lp
    } else if (adapterType === TYPE_ADAPTER.CURVE_4LP) {
        // code for apr calculation for curve_4lp
    } else if (adapterType === TYPE_ADAPTER.PICKLE_CURVE_GAUGE) {
        // code for apr calculation for pickle_curve_gauge
    } else if (adapterType === TYPE_ADAPTER.PICKLE_SINGLE_GAUGE) {
        // code for apr calculation for pickle_single_gauge
    } else if (adapterType === TYPE_ADAPTER.PICKLE_SUSHI_GAUGE) {
        // code for apr calculation for pickle_sushi_gauge
    } else if (adapterType === TYPE_ADAPTER.PICKLE_SUSHI_MASTER) {
        // code for apr calculation for pickle_sushi_master
    } else if (adapterType === TYPE_ADAPTER.SUSHISWAP_FARM) {
        // code for apr calculation for sushiswap_farm
    } else if (adapterType === TYPE_ADAPTER.SUSHISWAP_FARM_V2) {
        // code for apr calculation for sushiswap_farm_v2
    } else if (adapterType === TYPE_ADAPTER.UNISWAP_V3) {
        // code for apr calculation for uniswap_v3
    } else if (adapterType === TYPE_ADAPTER.YEARN_CURVE_VAULT) {
        // code for apr calculation for yearn_curve_vault
    } else if (adapterType === TYPE_ADAPTER.YEARN_SINGLE_VAULT) {
        // code for apr calculation for yearn_single_vault
    }
};

export { getAPR };
