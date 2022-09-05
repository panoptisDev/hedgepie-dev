import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../../../utils";
import { apeswapFarmLpAdapterArgsList } from "../../../config/constructor/bnb";
import {
  investor as investorAddress,
  adapterManager as adapterManagerAddress,
} from "../../../config/deployed/bnb";

const log: Logger = new Logger();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const BANANA = "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95";
const apeswapFarmLpAdapterArgs =
  apeswapFarmLpAdapterArgsList["ApeSwap::Farm::ETH-WBNB"];

async function deploy() {
  // deploy apeswap lp adapter contract
  const apeswapLpAdaperFactory = await hre.ethers.getContractFactory(
    "ApeswapFarmLPAdapter"
  );
  const apeswapLpAdaper = await apeswapLpAdaperFactory.deploy(
    apeswapFarmLpAdapterArgs.pid,
    apeswapFarmLpAdapterArgs.strategy,
    apeswapFarmLpAdapterArgs.stakingToken,
    apeswapFarmLpAdapterArgs.rewardToken,
    apeswapFarmLpAdapterArgs.router,
    apeswapFarmLpAdapterArgs.name
  );
  await await apeswapLpAdaper.deployed();
  const apeswapFarmLpAdapterAddress = apeswapLpAdaper.address;
  log.info(
    `ApeswapFarmLPAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${apeswapFarmLpAdapterAddress}`
  );

  // setting configuration
  log.info(`Setting configuration...`);

  // 1. adapterManager contract config
  // add apapters to adapterManager contract
  const adapterManagerInstance = await hre.ethers.getContractAt(
    "HedgepieAdapterManager",
    adapterManagerAddress
  );
  await adapterManagerInstance.addAdapter(apeswapFarmLpAdapterAddress, {
    gasPrice: 12e9,
  });
  console.log("111--->1");

  // 2. set apeswapFarmLp adapter contract config
  // set investor
  await apeswapLpAdaper.setInvestor(investorAddress);
  console.log("111--->2");
  // set path
  await await apeswapLpAdaper.setPath(WBNB, ETH, [WBNB, ETH], {
    gasPrice: 12e9,
  });
  console.log("111--->3");
  await await apeswapLpAdaper.setPath(ETH, WBNB, [ETH, WBNB], {
    gasPrice: 12e9,
  });
  console.log("111--->4");
  await await apeswapLpAdaper.setPath(WBNB, BANANA, [WBNB, BANANA], {
    gasPrice: 12e9,
  });
  console.log("111--->5");
  await await apeswapLpAdaper.setPath(BANANA, WBNB, [BANANA, WBNB], {
    gasPrice: 12e9,
  });
  console.log("111--->6");

  return {
    apeswapFarmLpAdapter: apeswapFarmLpAdapterAddress,
  };
}

async function main() {
  const { apeswapFarmLpAdapter } = await deploy();

  // verify Apeswap lp adapter contract
  await verify({
    contractName: "ApeswapFarmLPAdapter",
    address: apeswapFarmLpAdapter,
    constructorArguments: Object.values(apeswapFarmLpAdapterArgs),
    contractPath:
      "contracts/adapters/bnb/apeswap/apeswap-farm-lp-adapter.sol:ApeswapFarmLPAdapter",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
