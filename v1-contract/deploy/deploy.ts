import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../utils";
import {
    venusBUSDLendAdapterArgs,
    pksGalStakeAdapterArgs,
} from "../config/construct-arguments";

const log: Logger = new Logger();
const PKS_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const CAKE = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
const GAL = "0xe4Cc45Bb5DBDA06dB6183E8bf016569f40497Aa5";

const venusBUSDLendAdapterArgValues = Object.values(venusBUSDLendAdapterArgs);
const pksGalStakeAdapterArgValues = Object.values(pksGalStakeAdapterArgs);

async function deploy() {
    // deploy venusLendAdapter contract
    const venusLendAdapter = await hre.ethers.getContractFactory(
        "VenusLendAdapter"
    );
    const venusBUSDLendAdapterInstance = await venusLendAdapter.deploy(
        venusBUSDLendAdapterArgs.strategy,
        venusBUSDLendAdapterArgs.stakingToken,
        venusBUSDLendAdapterArgs.repayToken,
        venusBUSDLendAdapterArgs.name
    );
    await venusBUSDLendAdapterInstance.deployed();
    const venusBUSDLendAdapterAddress = venusBUSDLendAdapterInstance.address;
    log.info(
        `VenusBusdLendAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${venusBUSDLendAdapterAddress}`
    );

    // deploy pancakeswap GAL stake contract
    const pksGalStakeAdapter = await hre.ethers.getContractFactory(
        "PancakeStakeAdapter"
    );
    const pksGalStakeAdapterInstance = await pksGalStakeAdapter.deploy(
        pksGalStakeAdapterArgs.strategy,
        pksGalStakeAdapterArgs.stakingToken,
        pksGalStakeAdapterArgs.rewardToken,
        pksGalStakeAdapterArgs.name
    );
    await pksGalStakeAdapterInstance.deployed();
    const pksGalStakeAdapterAddress = pksGalStakeAdapterInstance.address;
    log.info(
        `PancakeGalStakeAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${pksGalStakeAdapterAddress}`
    );

    // deploy ybnft contract
    const ybnft = await hre.ethers.getContractFactory("YBNFT");
    const ybnftInstance = await ybnft.deploy();
    await ybnftInstance.deployed();
    const ybnftAddress = ybnftInstance.address;
    log.info(
        `YBNFT contract was successfully deployed on network: ${hre.network.name}, address: ${ybnftAddress}`
    );

    // deploy investor contract
    const investor = await hre.ethers.getContractFactory("HedgepieInvestor");
    const investorInstance = await investor.deploy(
        ybnftAddress,
        PKS_ROUTER,
        WBNB
    );
    await investorInstance.deployed();
    const investorAddress = investorInstance.address;
    log.info(
        `Investor contract was successfully deployed on network: ${hre.network.name}, address: ${investorAddress}`
    );

    // deploy adapterManager contract
    const adapterManager = await hre.ethers.getContractFactory(
        "HedgepieAdapterManager"
    );
    const adapterManagerInstance = await adapterManager.deploy();
    await adapterManagerInstance.deployed();
    const adapterManagerAddress = adapterManagerInstance.address;
    log.info(
        `AdapterManager contract was successfully deployed on network: ${hre.network.name}, address: ${adapterManagerAddress}`
    );

    // setting configuration
    log.info(`Setting configuration...`);
    adapterManagerInstance.addAdapter(pksGalStakeAdapterAddress);
    adapterManagerInstance.addAdapter(venusBUSDLendAdapterAddress);
    adapterManagerInstance.setInvestor(investorAddress);
    investorInstance.setAdapterManager(adapterManagerAddress);
    venusBUSDLendAdapterInstance.setInvestor(investorAddress);
    pksGalStakeAdapterInstance.setInvestor(investorAddress);

    return {
        venusBUSDLendAdapter: venusBUSDLendAdapterAddress,
        pksGalStakeAdapter: pksGalStakeAdapterAddress,
        ybnft: ybnftAddress,
        investor: investorAddress,
        adapterManager: adapterManagerAddress,
    };
}

async function main() {
    const {
        venusBUSDLendAdapter,
        pksGalStakeAdapter,
        ybnft,
        investor,
        adapterManager,
    } = await deploy();
    // verify venus BUSD lend adapter contract
    await verify({
        contractName: "VenusLendAdapter",
        address: venusBUSDLendAdapter,
        constructorArguments: venusBUSDLendAdapterArgValues,
        contractPath:
            "contracts/adapters/venus/venus-lend-adapter.sol:VenusLendAdapter",
    });

    // verify pks GAL stake adapter contract
    await verify({
        contractName: "PancakeStakeAdapter",
        address: pksGalStakeAdapter,
        constructorArguments: pksGalStakeAdapterArgValues,
        contractPath:
            "contracts/adapters/pancakeswap/pancake-stake-adapter.sol:PancakeStakeAdapter",
    });

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
