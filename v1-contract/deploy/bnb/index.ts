import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../utils";

const log: Logger = new Logger();
const PKS_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

async function deploy() {
    // libary deploy
    const Lib = await hre.ethers.getContractFactory("HedgepieLibrary");
    const lib = await Lib.deploy();
    await lib.deployed();

    log.info(
        `HedgepieLibrary contract was successfully deployed on network: ${hre.network.name}, address: ${lib.address}`
    );

    // deploy ybnft contract
    const ybnftFactory = await hre.ethers.getContractFactory("YBNFT");
    const ybnft = await ybnftFactory.deploy();
    await ybnft.deployed();
    const ybnftAddress = ybnft.address;
    log.info(
        `YBNFT contract was successfully deployed on network: ${hre.network.name}, address: ${ybnftAddress}`
    );

    // deploy investor contract
    const investorFactory = await hre.ethers.getContractFactory(
        "HedgepieInvestor",
        {
            libraries: { HedgepieLibrary: lib.address },
        }
    );
    const investor = await investorFactory.deploy(
        ybnftAddress,
        PKS_ROUTER,
        WBNB
    );
    await investor.deployed();
    const investorAddress = investor.address;
    log.info(
        `Investor contract was successfully deployed on network: ${hre.network.name}, address: ${investorAddress}`
    );

    // deploy adapterManager contract
    const adapterManagerFactory = await hre.ethers.getContractFactory(
        "HedgepieAdapterManager"
    );
    const adapterManager = await adapterManagerFactory.deploy();
    await adapterManager.deployed();
    const adapterManagerAddress = adapterManager.address;
    log.info(
        `AdapterManager contract was successfully deployed on network: ${hre.network.name}, address: ${adapterManagerAddress}`
    );

    // setting configuration
    log.info(`Setting configuration...`);

    // 1. adapterManager contract config
    await adapterManager.setInvestor(investorAddress, {
        gasPrice: 12e9,
    });

    // 2. investor contract config
    await investor.setAdapterManager(adapterManagerAddress, {
        gasPrice: 12e9,
    });

    return {
        ybnft: ybnftAddress,
        investor: investorAddress,
        adapterManager: adapterManagerAddress,
    };
}

async function main() {
    const { ybnft, investor, adapterManager } = await deploy();

    // verify ybnft contract
    await verify({
        contractName: "YBNFT",
        address: ybnft,
        constructorArguments: [],
        contractPath: "contracts/HedgepieYBNFT.sol:YBNFT",
    });

    // verify investor contract
    await verify({
        contractName: "HedgepieInvestor",
        address: investor,
        constructorArguments: [ybnft, PKS_ROUTER, WBNB],
        contractPath: "contracts/HedgepieInvestor.sol:HedgepieInvestor",
    });

    // verify adapterManager contract
    await verify({
        contractName: "HedgepieAdapterManager",
        address: adapterManager,
        constructorArguments: [],
        contractPath:
            "contracts/HedgepieAdapterManager.sol:HedgepieAdapterManager",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
