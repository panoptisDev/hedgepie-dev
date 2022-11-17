import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../../utils";
import { beefyAdapterArgsList } from "../../../config/constructor/bnb";
import {
    investor as investorAddress,
    adapterManager as adapterManagerAddress,
} from "../../../config/deployed/bnb";

const log: Logger = new Logger();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const beefyAdapterArgs = beefyAdapterArgsList["Beefy::Vault::Biswap USDT-BUSD"];

async function deploy() {
    // deploy Beefy vault adapter contract
    const beefyVaultAdapterFactory = await hre.ethers.getContractFactory(
        "BeefyVaultAdapter"
    );
    const beefyVaultAdapter = await beefyVaultAdapterFactory.deploy(
        beefyAdapterArgs.strategy,
        beefyAdapterArgs.stakingToken,
        beefyAdapterArgs.router,
        beefyAdapterArgs.name
    );
    await await beefyVaultAdapter.deployed();
    const beefyVaultAdapterAddress = beefyVaultAdapter.address;
    log.info(
        `BeefyVaultAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${beefyVaultAdapterAddress}`
    );

    // setting configuration
    log.info(`Setting configuration...`);

    // 1. adapterManager contract config
    // add apapters to adapterManager contract
    const adapterManagerInstance = await hre.ethers.getContractAt(
        "HedgepieAdapterManager",
        adapterManagerAddress
    );
    await adapterManagerInstance.addAdapter(beefyVaultAdapterAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->1");

    // 2. set beefyVaultAdapter adapter contract config
    // set investor
    await beefyVaultAdapter.setInvestor(investorAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->2");
    // set path
    await beefyVaultAdapter.setPath(WBNB, USDT, [WBNB, USDT], {
        gasPrice: 12e9,
    });
    await beefyVaultAdapter.setPath(USDT, WBNB, [USDT, WBNB], {
        gasPrice: 12e9,
    });
    console.log("111--->3");
    await beefyVaultAdapter.setPath(WBNB, BUSD, [WBNB, BUSD], {
        gasPrice: 12e9,
    });
    await beefyVaultAdapter.setPath(BUSD, WBNB, [BUSD, WBNB], {
        gasPrice: 12e9,
    });
    console.log("111--->4");

    return {
        beefyVaultAdapter: beefyVaultAdapterAddress,
    };
}

async function main() {
    const { beefyVaultAdapter } = await deploy();

    // verify Beefy Vault adapter contract
    await verify({
        contractName: "BeefyVaultAdapter",
        address: beefyVaultAdapter,
        constructorArguments: Object.values(beefyAdapterArgs),
        contractPath:
            "contracts/adapters/bnb/beefy/beefy-vault-adapter.sol:BeefyVaultAdapter",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
