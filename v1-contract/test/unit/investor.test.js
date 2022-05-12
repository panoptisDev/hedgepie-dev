const { ethers } = require("hardhat");
const { expect } = require("chai");
const { constants, utils } = require("ethers");


describe("Investor contract test:", () => {
  // contracts
  let investorFactory;
  let investor;

  let strategyPancakeStakingPoolAdapterFactory;
  let strategyPancakeStakingPoolAdapter;

  let adapterManagerFactory;
  let adapterManager;

  // accounts
  let deployer;
  let account1;

  let mockBEP20; // mock erc20 token
  let hardhatMockBEP20;

  // constants
  const ybNftAddr = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
  const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E" // pks rounter address
  const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
  const cakeGalStakingPool = "0xa5D57C5dca083a7051797920c78fb2b19564176B" // cake - gal staking pool
  const cake = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82" // cake token
  const gal = "0xe4cc45bb5dbda06db6183e8bf016569f40497aa5" // gal token


  beforeEach(async () => {
    [deployer, account1] = await ethers.getSigners();



    // investor contract prepare
    investorFactory = await ethers.getContractFactory('HedgepieInvestor');
    investor = await investorFactory.deploy(
      ybNftAddr,
      swapRouter,
      wbnb
    );

    // strategy manager contract prepare
    adapterManagerFactory = await ethers.getContractFactory('HedgepieAdapterManager');
    adapterManager = await adapterManagerFactory.deploy();

    // strategy contract prepare
    strategyFactory = await ethers.getContractFactory('StrategyPancakeIFOAdapter');
    strategy1 = await strategyFactory.deploy(
      wbnb,
      wbnb,
      ybNftAddr
    );

    await investor.setadapterManager(adapterManager.address)

  });

  describe("deposit function test", () => {
    it("should be succeeded", async () => {
      console.log('111--->msg.sender', account1.address)
      console.log('111--->manager', adapterManager.address)
      console.log('111--->strategy', strategy1.address)
      await investor.connect(account1).mockTest(strategy1.address)
    });
  });
});
