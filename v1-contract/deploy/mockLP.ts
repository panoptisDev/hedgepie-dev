import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { mockLPArgs } from "../config/construct-arguments";
import { verify } from "../utils";

const log: Logger = new Logger();
const contractName = "MockLP";
const mockLPArgValues = Object.values(mockLPArgs);

async function deploy() {
    log.info(`Deploying "${contractName}" on network: ${hre.network.name}`);
    const deployContract = await hre.ethers.getContractFactory(contractName);
    const deployContractInstance = await deployContract.deploy(
        mockLPArgs.name,
        mockLPArgs.symbol,
        mockLPArgs.initialSupply
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
        constructorArguments: mockLPArgValues,
        contractPath: "contracts/mock/MockLP.sol:MockLP",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
