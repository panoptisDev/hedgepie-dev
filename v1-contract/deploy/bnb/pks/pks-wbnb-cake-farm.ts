import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../../utils";
import { pksAdapterArgsList } from "../../../config/constructor/bnb";
import {
    investor as investorAddress,
    adapterManager as adapterManagerAddress,
} from "../../../config/deployed/bnb";

const log: Logger = new Logger();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
const pksAdapterArgs = pksAdapterArgsList["PKS::Farm::WBNB-CAKE"];

async function deploy() {
    // deploy Pancakeswap farm adapter contract
    const pksAdapterFactory = await hre.ethers.getContractFactory(
        "PancakeSwapFarmLPAdapter"
    );
    const pksAdapter = await pksAdapterFactory.deploy(
        pksAdapterArgs.poolId,
        pksAdapterArgs.strategy,
        pksAdapterArgs.stakingToken,
        pksAdapterArgs.rewardToken,
        pksAdapterArgs.router,
        pksAdapterArgs.name
    );
    await await pksAdapter.deployed();
    const pksAdapterAddress = pksAdapter.address;
    log.info(
        `PancakeSwapFarmLPAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${pksAdapterAddress}`
    );

    // setting configuration
    log.info(`Setting configuration...`);

    // 1. adapterManager contract config
    // add apapters to adapterManager contract
    const adapterManagerInstance = await hre.ethers.getContractAt(
        "HedgepieAdapterManager",
        adapterManagerAddress
    );
    await adapterManagerInstance.addAdapter(pksAdapterAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->1");

    // 2. set pksAdapter adapter contract config
    // set investor
    await pksAdapter.setInvestor(investorAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->2");
    // set path
    await pksAdapter.setPath(WBNB, CAKE, [WBNB, CAKE], {
        gasPrice: 12e9,
    });
    await pksAdapter.setPath(CAKE, WBNB, [CAKE, WBNB], {
        gasPrice: 12e9,
    });
    console.log("111--->3");

    return {
        pksAdapter: pksAdapterAddress,
    };
}

async function main() {
    const { pksAdapter } = await deploy();

    // verify Pancakeswap farm adapter contract
    await verify({
        contractName: "PancakeSwapFarmLPAdapter",
        address: pksAdapter,
        constructorArguments: Object.values(pksAdapterArgs),
        contractPath:
            "contracts/adapters/bnb/pancakeswap/pancake-farm-adapter.sol:PancakeSwapFarmLPAdapter",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
