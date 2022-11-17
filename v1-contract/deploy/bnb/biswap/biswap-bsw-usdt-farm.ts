import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../../utils";
import { biswapAdapterArgsList } from "../../../config/constructor/bnb";
import {
    investor as investorAddress,
    adapterManager as adapterManagerAddress,
} from "../../../config/deployed/bnb";

const log: Logger = new Logger();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BSW = "0x965f527d9159dce6288a2219db51fc6eef120dd1";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const biswapAdapterArgs = biswapAdapterArgsList["Biswap::Farm::USDT-BSW"];

async function deploy() {
    // deploy biswap farm adapter contract
    const biswapFarmAdaperFactory = await hre.ethers.getContractFactory(
        "BiSwapFarmLPAdapter"
    );
    const biswapFarmAdaper = await biswapFarmAdaperFactory.deploy(
        biswapAdapterArgs.poolId,
        biswapAdapterArgs.strategy,
        biswapAdapterArgs.stakingToken,
        biswapAdapterArgs.rewardToken,
        biswapAdapterArgs.router,
        biswapAdapterArgs.name
    );
    await await biswapFarmAdaper.deployed();
    const biswapFarmAdaperAddress = biswapFarmAdaper.address;
    log.info(
        `BiSwapFarmLPAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${biswapFarmAdaperAddress}`
    );

    // setting configuration
    log.info(`Setting configuration...`);

    // 1. adapterManager contract config
    // add apapters to adapterManager contract
    const adapterManagerInstance = await hre.ethers.getContractAt(
        "HedgepieAdapterManager",
        adapterManagerAddress
    );
    await adapterManagerInstance.addAdapter(biswapFarmAdaperAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->1");

    // 2. set biswapFarmAdaper adapter contract config
    // set investor
    await biswapFarmAdaper.setInvestor(investorAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->2");
    // set path
    await biswapFarmAdaper.setPath(WBNB, BSW, [WBNB, BSW], {
        gasPrice: 12e9,
    });
    await biswapFarmAdaper.setPath(BSW, WBNB, [BSW, WBNB], {
        gasPrice: 12e9,
    });
    // set path
    await biswapFarmAdaper.setPath(WBNB, USDT, [WBNB, USDT], {
        gasPrice: 12e9,
    });
    await biswapFarmAdaper.setPath(USDT, WBNB, [USDT, WBNB], {
        gasPrice: 12e9,
    });
    console.log("111--->3");

    return {
        biswapFarmAdaper: biswapFarmAdaperAddress,
    };
}

async function main() {
    const { biswapFarmAdaper } = await deploy();

    // verify Biswap Vault adapter contract
    await verify({
        contractName: "BiSwapFarmLPAdapter",
        address: biswapFarmAdaper,
        constructorArguments: Object.values(biswapAdapterArgs),
        contractPath:
            "contracts/adapters/bnb/biswap/biswap-farm-lp-adapter.sol:BiSwapFarmLPAdapter",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
