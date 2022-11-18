import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../../utils";
import { alpacaAdapterArgsList } from "../../../config/constructor/bnb";
import {
    investor as investorAddress,
    adapterManager as adapterManagerAddress,
} from "../../../config/deployed/bnb";

const log: Logger = new Logger();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const alpacaAdapterArgs = alpacaAdapterArgsList["Alpaca::AUSD::ibUSDT"];

async function deploy() {
    // deploy Alpaca ausd adapter contract
    const alpacaAdapterFactory = await hre.ethers.getContractFactory(
        "AlpacaAUSDAdapter"
    );
    const alpacaAdapter = await alpacaAdapterFactory.deploy(
        alpacaAdapterArgs.strategy,
        alpacaAdapterArgs.stakingToken,
        alpacaAdapterArgs.rewardToken,
        alpacaAdapterArgs.repayToken,
        alpacaAdapterArgs.name
    );
    await await alpacaAdapter.deployed();
    const alpacaAdapterAddress = alpacaAdapter.address;
    log.info(
        `AlpacaAUSDAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${alpacaAdapterAddress}`
    );

    // setting configuration
    log.info(`Setting configuration...`);

    // 1. adapterManager contract config
    // add apapters to adapterManager contract
    const adapterManagerInstance = await hre.ethers.getContractAt(
        "HedgepieAdapterManager",
        adapterManagerAddress
    );
    await adapterManagerInstance.addAdapter(alpacaAdapterAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->1");

    // 2. set alpacaAdapter adapter contract config
    // set investor
    await alpacaAdapter.setInvestor(investorAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->2");
    // set path
    await alpacaAdapter.setPath(WBNB, USDT, [WBNB, USDT], {
        gasPrice: 12e9,
    });
    await alpacaAdapter.setPath(USDT, WBNB, [USDT, WBNB], {
        gasPrice: 12e9,
    });
    console.log("111--->3");

    return {
        alpacaAdapter: alpacaAdapterAddress,
    };
}

async function main() {
    const { alpacaAdapter } = await deploy();

    // verify Alpaca ausd adapter contract
    await verify({
        contractName: "AlpacaAUSDAdapter",
        address: alpacaAdapter,
        constructorArguments: Object.values(alpacaAdapterArgs),
        contractPath:
            "contracts/adapters/bnb/alpaca/alpaca-ausd-adapter.sol:AlpacaAUSDAdapter",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
