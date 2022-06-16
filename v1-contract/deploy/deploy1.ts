import hre from "hardhat";
import { Logger } from "tslog";
import "@nomiclabs/hardhat-ethers";
import { verify } from "../utils";
import { apeswapFarmLpAdapterArgs, autoFarmAdapterArgs } from "../config/construct-arguments";

const log: Logger = new Logger();
const PKS_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const CAKE = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
const GAL = "0xe4Cc45Bb5DBDA06dB6183E8bf016569f40497Aa5";

const apeswapFarmLpAdapterArgValues = Object.values(apeswapFarmLpAdapterArgs);
const autoFarmAdapterArgValues = Object.values(autoFarmAdapterArgs);

async function deploy() {
  // deploy apeswap adapter contract
  const apeswapLpAdaper = await hre.ethers.getContractFactory("ApeswapFarmLPAdapter");
  const apeswapLpAdaperInstance = await apeswapLpAdaper.deploy(
    apeswapFarmLpAdapterArgs.pid,
    apeswapFarmLpAdapterArgs.strategy,
    apeswapFarmLpAdapterArgs.stakingToken,
    apeswapFarmLpAdapterArgs.rewardToken,
    apeswapFarmLpAdapterArgs.router,
    apeswapFarmLpAdapterArgs.name
  );
  await apeswapLpAdaperInstance.deployed();
  const apeswapFarmLpAdapterAddress = apeswapLpAdaperInstance.address;
  log.info(
    `ApeswapFarmLPAdapter contract was successfully deployed on network: ${hre.network.name}, address: ${apeswapFarmLpAdapterAddress}`
  );

  // deploy Autofarm Lp adater contract
  const autoFarmLpAdapter = await hre.ethers.getContractFactory("AutoFarmAdapter");
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
  await adapterManagerInstance.addAdapter(apeswapFarmLpAdapterAddress);
  adapterManagerInstance.addAdapter(autoFarmLpAdapterAddress);
  adapterManagerInstance.setInvestor(investorAddress);
  investorInstance.setAdapterManager(adapterManagerAddress);
  apeswapLpAdaperInstance.setInvestor(investorAddress);
  autoFarmLpAdapterInstance.setInvestor(investorAddress);

  return {
    apeswapFarmLpAdapter: apeswapFarmLpAdapterAddress,
    autofarmLpAdapter: autoFarmLpAdapterAddress,
    ybnft: ybnftAddress,
    investor: investorAddress,
    adapterManager: adapterManagerAddress
  };
}

async function main() {
  // const { apeswapFarmLpAdapter, autofarmLpAdapter, ybnft, investor, adapterManager } = await deploy();

  const apeswapFarmLpAdapter = "0x80D8EC205716a8a407433D4Ed44cd16a57131162";
  const autofarmLpAdapter = "0x7428943E183e08794D5129b9676853638cAe1d3E";
  const ybnft = "0xFb32CafDfF9d80597152E5caC818747886e8B956";
  const investor = "0x4e2F09FfA5926F94aa61765fC4311b152104fE8A";
  const adapterManager = '0x53C49bfAdd9ff9219522d1528504a899d007DfF3';
  // verify Apeswap lp adapter contract
  await verify({
    contractName: "ApeswapFarmLPAdapter",
    address: apeswapFarmLpAdapter,
    constructorArguments: apeswapFarmLpAdapterArgValues,
    contractPath: "contracts/adapters/apeswap/apeswap-farm-lp-adapter.sol:ApeswapFarmLPAdapter",
  });

  // verify Autofarm lp adapter contract
  await verify({
    contractName: "AutoFarmAdapter",
    address: autofarmLpAdapter,
    constructorArguments: autoFarmAdapterArgValues,
    contractPath: "contracts/adapters/autofarm/auto-farm-adapter.sol:AutoFarmAdapter",
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
    contractPath: "contracts/HedgepieAdapterManager.sol:HedgepieAdapterManager",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
