import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../utils";
import { apeswapLpAdapterArgs, autoFarmAdapterArgs } from "../config/construct-arguments";

const log: Logger = new Logger();
const PKS_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const CAKE = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
const GAL = "0xe4Cc45Bb5DBDA06dB6183E8bf016569f40497Aa5";

const apeswapLpAdapterArgValues = Object.values(apeswapLpAdapterArgs);
const autoFarmAdapterArgValues = Object.values(autoFarmAdapterArgs);

async function deploy() {
  // deploy apeswap adapter contract
  const apeswapLpAdaper = await hre.ethers.getContractFactory("ApeswapLPAdapter");
  const apeswapLpAdaperInstance = await apeswapLpAdaper.deploy(
    apeswapLpAdapterArgs.pid,
    apeswapLpAdapterArgs.strategy,
    apeswapLpAdapterArgs.stakingToken,
    apeswapLpAdapterArgs.rewardToken,
    apeswapLpAdapterArgs.router,
    apeswapLpAdapterArgs.name
  );
  await apeswapLpAdaperInstance.deployed();
  const apeswapLpAdapterAddress = apeswapLpAdaperInstance.address;
  log.info(
    `ApeswapLPAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${apeswapLpAdapterAddress}`
  );

  // deploy Autofarm Lp adater contract
  const autoFarmLpAdapter = await hre.ethers.getContractFactory("ApeswapLPAdapter");
  const autoFarmLpAdapterInstance = await autoFarmLpAdapter.deploy(
    autoFarmAdapterArgs.strategy,
    autoFarmAdapterArgs.vStrategy,
    autoFarmAdapterArgs.stakingToken,
    autoFarmAdapterArgs.rewardToken,
    autoFarmAdapterArgs.router,
    autoFarmAdapterArgs.name
  );
  await autoFarmLpAdapterInstance.deployed();
  const autoFarmLpAdapterAddress = autoFarmLpAdapterInstance.address;
  log.info(
    `AutoFarmLpAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${autoFarmLpAdapterAddress}`
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
  const adapterManager = await hre.ethers.getContractFactory("HedgepieAdapterManager");
  const adapterManagerInstance = await adapterManager.deploy();
  await adapterManagerInstance.deployed();
  const adapterManagerAddress = adapterManagerInstance.address;
  log.info(
    `AdapterManager contract was successfully deployed on network: ${hre.network.name}, address: ${adapterManagerAddress}`
  );

  // setting configuration
  log.info(`Setting configuration...`);
  adapterManagerInstance.addAdapter(apeswapLpAdapterAddress);
  adapterManagerInstance.addAdapter(autoFarmLpAdapterAddress);
  adapterManagerInstance.setInvestor(investorAddress);
  investorInstance.setAdapterManager(adapterManagerAddress);
  apeswapLpAdaperInstance.setInvestor(investorAddress);
  autoFarmLpAdapterInstance.setInvestor(investorAddress);

  return {
    apeswapLpAdapter: apeswapLpAdapterAddress,
    autofarmLpAdapter: autoFarmLpAdapterAddress,
    ybnft: ybnftAddress,
    investor: investorAddress,
    adapterManager: adapterManagerAddress
  };
}

async function main() {
  // const { apeswapLpAdapter, autofarmLpAdapter, ybnft, investor, adapterManager } = await deploy();
  // // verify Apeswap lp adapter contract
  // await verify({
  //   contractName: "ApeswapLPAdapter",
  //   address: apeswapLpAdapter,
  //   constructorArguments: apeswapLpAdapterArgValues,
  //   contractPath: "contracts/adapters/apeswap/apeswap-lp-adapter.sol:ApeswapLPAdapter",
  // });

  // // verify Autofarm lp adapter contract
  // await verify({
  //   contractName: "AutoFarmAdapter",
  //   address: autofarmLpAdapter,
  //   constructorArguments: autoFarmAdapterArgValues,
  //   contractPath: "contracts/adapters/autofarm/auto-farm-adapter.sol:AutoFarmAdapter",
  // });

  const ybnft = "0x43F29Ecfd739Bb2E0f7E7860b56c5cb90edb54f5"
  const investor = "0x2a51D665c3fA888666EB68EA7908ccB66E6EbAD3"
  const adapterManager = "0x1b369FE56aE5989F8005cCAe8978eD2fd2bA5EFd"

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
    contractPath: "contracts/HedgepieAdapterManager.sol:HedgepieAdapterManager",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
