import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../../utils";
import { autoFarmAdapterArgsList } from "../../../config/constructor/bnb";
import {
    investor as investorAddress,
    adapterManager as adapterManagerAddress,
} from "../../../config/deployed/bnb";

const log: Logger = new Logger();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
const autoFarmVaultAdapterArgs =
    autoFarmAdapterArgsList["AutoFarm::Vault::WBNB-CAKE"];

async function deploy() {
    // deploy autofarm vault adapter contract
    const autofarmVaultAdaperFactory = await hre.ethers.getContractFactory(
        "AutoVaultAdapter"
    );
    const autofarmVaultAdaper = await autofarmVaultAdaperFactory.deploy(
        autoFarmVaultAdapterArgs.strategy,
        autoFarmVaultAdapterArgs.vStrategy,
        autoFarmVaultAdapterArgs.stakingToken,
        autoFarmVaultAdapterArgs.rewardToken,
        autoFarmVaultAdapterArgs.router,
        autoFarmVaultAdapterArgs.name
    );
    await await autofarmVaultAdaper.deployed();
    const autofarmVaultAdaperAddress = autofarmVaultAdaper.address;
    log.info(
        `AutofarmVaultAdaper contract was successfully deployed on network: ${hre.network.name}, address: ${autofarmVaultAdaperAddress}`
    );

    // setting configuration
    log.info(`Setting configuration...`);

    // 1. adapterManager contract config
    // add apapters to adapterManager contract
    const adapterManagerInstance = await hre.ethers.getContractAt(
        "HedgepieAdapterManager",
        adapterManagerAddress
    );
    await adapterManagerInstance.addAdapter(autofarmVaultAdaperAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->1");

    // 2. set apeswapFarmLp adapter contract config
    // set investor
    await autofarmVaultAdaper.setInvestor(investorAddress, {
        gasPrice: 12e9,
    });
    console.log("111--->2");
    // set path
    await autofarmVaultAdaper.setPath(WBNB, CAKE, [WBNB, CAKE], {
        gasPrice: 12e9,
    });
    await autofarmVaultAdaper.setPath(CAKE, WBNB, [CAKE, WBNB], {
        gasPrice: 12e9,
    });
    console.log("111--->3");
    // set poolId
    await autofarmVaultAdaper.setPoolID(619, {
        gasPrice: 12e9,
    });
    console.log("111--->4");

    return {
        autofarmVaultAdaper: autofarmVaultAdaperAddress,
    };
}

async function main() {
    const { autofarmVaultAdaper } = await deploy();

    // verify Autofarm Vault adapter contract
    await verify({
        contractName: "AutoVaultAdapter",
        address: autofarmVaultAdaper,
        constructorArguments: Object.values(autoFarmVaultAdapterArgs),
        contractPath:
            "contracts/adapters/bnb/autofarm/auto-vault-adapter.sol:AutoVaultAdapter",
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
