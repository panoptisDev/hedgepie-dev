import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../../utils";
import { beltAdapterArgsList } from "../../../config/constructor/bnb";
import {
  investor as investorAddress,
  adapterManager as adapterManagerAddress,
} from "../../../config/deployed/bnb";

const log: Logger = new Logger();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const beltAdapterArgs = beltAdapterArgsList["Belt::Vault::USDT"];

async function deploy() {
  // deploy Belt vault adapter contract
  const beltVaultAdapterFactory = await hre.ethers.getContractFactory(
    "BeltVaultAdapter"
  );
  const beltVaultAdapter = await beltVaultAdapterFactory.deploy(
    beltAdapterArgs.strategy,
    beltAdapterArgs.stakingToken,
    beltAdapterArgs.rewardToken,
    beltAdapterArgs.repayToken,
    beltAdapterArgs.name
  );
  await await beltVaultAdapter.deployed();
  const beltVaultAdapterAddress = beltVaultAdapter.address;
  log.info(
    `BeltVaultAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${beltVaultAdapterAddress}`
  );

  // setting configuration
  log.info(`Setting configuration...`);

  // 1. adapterManager contract config
  // add apapters to adapterManager contract
  const adapterManagerInstance = await hre.ethers.getContractAt(
    "HedgepieAdapterManager",
    adapterManagerAddress
  );
  await adapterManagerInstance.addAdapter(beltVaultAdapterAddress, {
    gasPrice: 12e9,
  });
  console.log("111--->1");

  // 2. set beltVaultAdapter adapter contract config
  // set investor
  await beltVaultAdapter.setInvestor(investorAddress, {
    gasPrice: 12e9,
  });
  console.log("111--->2");
  // set path
  await beltVaultAdapter.setPath(WBNB, USDT, [WBNB, USDT], {
    gasPrice: 12e9,
  });
  await beltVaultAdapter.setPath(USDT, WBNB, [USDT, WBNB], {
    gasPrice: 12e9,
  });
  console.log("111--->3");

  return {
    beltVaultAdapter: beltVaultAdapterAddress,
  };
}

async function main() {
  const { beltVaultAdapter } = await deploy();

  // verify Belt Vault adapter contract
  await verify({
    contractName: "BeltVaultAdapter",
    address: beltVaultAdapter,
    constructorArguments: Object.values(beltAdapterArgs),
    contractPath:
      "contracts/adapters/bnb/belt.fi/belt-vault-adapter.sol:BeltVaultAdapter",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
