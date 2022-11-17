import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../utils";
import { masterChefArgs } from "../config/construct-arguments";

const log: Logger = new Logger();
const contractName = "HedgepieMasterChef";
const masterChefArgValues = Object.values(masterChefArgs);

async function deploy() {
    log.info(`Deploying "${contractName}" on network: ${hre.network.name}`);
    const deployContract = await hre.ethers.getContractFactory(contractName);

    const deployContractInstance = await deployContract.deploy(
        masterChefArgs.lp,
        masterChefArgs.rewardToken,
        masterChefArgs.rewardPerBlock,
        masterChefArgs.rewardHolder
    );

    await deployContractInstance.deployed();
    const deployContractAddress = deployContractInstance.address;
    log.info(
        `"${contractName}" was successfully deployed on network: ${hre.network.name}, address: ${deployContractAddress}`
    );
    return { deployedAddr: deployContractAddress };
}

async function main() {
    const { deployedAddr } = await deploy();
    await verify({
        contractName,
        address: deployedAddr,
        constructorArguments: masterChefArgValues,
        contractPath: "contracts/HedgepieMasterChef.sol:HedgepieMasterChef",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
