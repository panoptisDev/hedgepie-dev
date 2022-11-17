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
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const alpacaAdapterArgs = alpacaAdapterArgsList["Alpaca::Lend::Cake"];

async function deploy() {
    // deploy Alpaca lend adapter contract
    const alpacaAdapterFactory = await hre.ethers.getContractFactory(
        "AlpacaLendAdapter"
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
        `AlpacaLendAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${alpacaAdapterAddress}`
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
    await alpacaAdapter.setPath(WBNB, BUSD, [WBNB, BUSD], {
        gasPrice: 12e9,
    });
    await alpacaAdapter.setPath(BUSD, WBNB, [BUSD, WBNB], {
        gasPrice: 12e9,
    });
    console.log("111--->3");

    return {
        alpacaAdapter: alpacaAdapterAddress,
    };
}

async function main() {
    const { alpacaAdapter } = await deploy();

    // verify Alpaca lend adapter contract
    await verify({
        contractName: "AlpacaLendAdapter",
        address: alpacaAdapter,
        constructorArguments: Object.values(alpacaAdapterArgs),
        contractPath:
            "contracts/adapters/bnb/alpaca/alpaca-lend-adapter.sol:AlpacaLendAdapter",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
