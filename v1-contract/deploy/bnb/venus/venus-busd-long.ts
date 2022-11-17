import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../../utils";
import { venusAdapterArgsList } from "../../../config/constructor/bnb";
import {
    investor as investorAddress,
    adapterManager as adapterManagerAddress,
} from "../../../config/deployed/bnb";

const log: Logger = new Logger();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const venusAdapterArgs = venusAdapterArgsList["Venus::Long::BUSD"];

async function deploy() {
    // deploy Venus long adapter contract
    const venusAdapterFactory = await hre.ethers.getContractFactory(
        "VenusLongLevAdapter"
    );
    const venusAdapter = await venusAdapterFactory.deploy(
        venusAdapterArgs.strategy,
        venusAdapterArgs.name
    );
    await await venusAdapter.deployed();
    const venusAdapterAddress = venusAdapter.address;
    log.info(
        `VenusLongLevAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${venusAdapterAddress}`
    );

    // setting configuration
    log.info(`Setting configuration...`);

    // 1. adapterManager contract config
    // add apapters to adapterManager contract
    const adapterManagerInstance = await hre.ethers.getContractAt(
        "HedgepieAdapterManager",
        adapterManagerAddress
    );
    await adapterManagerInstance.addAdapter(venusAdapterAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->1");

    // 2. set venusAdapter adapter contract config
    // set investor
    await venusAdapter.setInvestor(investorAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->2");
    // set path
    await venusAdapter.setPath(WBNB, BUSD, [WBNB, BUSD], {
        gasPrice: 12e9,
    });
    await venusAdapter.setPath(BUSD, WBNB, [BUSD, WBNB], {
        gasPrice: 12e9,
    });
    console.log("111--->3");

    return {
        venusAdapter: venusAdapterAddress,
    };
}

async function main() {
    const { venusAdapter } = await deploy();

    // verify Venus long adapter contract
    await verify({
        contractName: "VenusLongLevAdapter",
        address: venusAdapter,
        constructorArguments: Object.values(venusAdapterArgs),
        contractPath:
            "contracts/adapters/bnb/venus/venus-long-adapter.sol:VenusLongLevAdapter",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
