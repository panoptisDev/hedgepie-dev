const hre = require("hardhat");
const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const E18 = BigNumber.from(10).pow(18);

const unlockAccount = async (address) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return hre.ethers.provider.getSigner(address);
};

describe("Pancakeswap Stake Adapter Integration Test", function () {
  const performanceFee = 50;
  const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address
  const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
  const cake = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
  const gal = "0xe4Cc45Bb5DBDA06dB6183E8bf016569f40497Aa5";
  const WHALE = "0x41772edd47d9ddf9ef848cdb34fe76143908c7ad";


  before("Deploy contract", async function () {
    const [owner, alice] = await ethers.getSigners();

    this.whaleWallet = await unlockAccount(WHALE);
    this.owner = owner;
    this.alice = alice;
    this.strategy = "0xa5D57C5dca083a7051797920c78fb2b19564176B";
    this.stakingToken = cake;
    this.rewardToken = gal;

    // Deploy Venus Adapter contract
    const PksStakeAdapter = await ethers.getContractFactory("PancakeStakeAdapter");
    this.pksStakeAdapter = await PksStakeAdapter.deploy(
      this.strategy,
      this.stakingToken,
      this.rewardToken,
      "PKS-STAKE-GAL-ADAPTER"
    );
    await this.pksStakeAdapter.deployed();

    // Deploy YBNFT contract
    ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    // Mint NFTs
    await this.ybNft.mint(
      [10000],
      [cake],
      [this.pksStakeAdapter.address],
      performanceFee,
      "test tokenURI"
    );

    // Deploy Investor contract
    investorFactory = await ethers.getContractFactory("HedgepieInvestor");
    this.investor = await investorFactory.deploy(
      this.ybNft.address,
      swapRouter,
      wbnb
    );

    // Deploy Adaptor Manager contract
    adapterManagerFactory = await ethers.getContractFactory(
      "HedgepieAdapterManager"
    );
    this.adapterManager = await adapterManagerFactory.deploy();

    // Add Venus Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.pksStakeAdapter.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set investor in pksStakeAdapter
    await this.pksStakeAdapter.setInvestor(this.investor.address);


    console.log("YBNFT: ", this.ybNft.address);
    console.log("Investor: ", this.investor.address);
    console.log("PKSStakeAdapter: ", this.pksStakeAdapter.address);
    console.log("AdapterManager: ", this.adapterManager.address);
    console.log("Strategy: ", this.strategy);
    console.log("Owner: ", this.owner.address);

    this.whaleWallet = await unlockAccount(WHALE);
    this.CAKE = await ethers.getContractAt("contracts/interfaces/IBEP20.sol:IBEP20", cake);
    this.GAL = await ethers.getContractAt("contracts/interfaces/IBEP20.sol:IBEP20", gal);
    this.WBNB = await ethers.getContractAt("contracts/interfaces/IBEP20.sol:IBEP20", wbnb);


    await this.WBNB.connect(this.whaleWallet).transfer(
      this.owner.address,
      ethers.utils.parseEther("10").toString()
    );

    // Approve investor to move wbnb
    await this.WBNB.approve(this.investor.address, ethers.constants.MaxUint256);
  });

  describe("should set correct state variable", function () {
    it("(1) Check strategy address", async function () {
      expect(await this.pksStakeAdapter.strategy()).to.eq(this.strategy);
    });

    it("(2) Check owner wallet", async function () {
      expect(await this.pksStakeAdapter.owner()).to.eq(this.owner.address);
    });

    it("(3) Check AdapterManager address in Investor contract", async function () {
      expect(await this.investor.adapterManager()).to.eq(
        this.adapterManager.address
      );
    });

    it("(4) Check Investor address in AdapterManager contract", async function () {
      expect(await this.adapterManager.investor()).to.eq(this.investor.address);
    });

    it("(5) Check owner wallet", async function () {
      expect(await this.pksStakeAdapter.owner()).to.eq(this.owner.address);
    });

    it("(6) Check AdapterInfo of YBNFT", async function () {
      const response = await this.ybNft.getAdapterInfo(1);
      expect(response[0].allocation).to.eq(10000);
      expect(response[0].token.toLowerCase()).to.eq(cake.toLowerCase());
      expect(response[0].addr).to.eq(this.pksStakeAdapter.address);
    });
  });


  describe("deposit() function test", function () {
    it("should success", async function () {
      const wbnbBalBefore = await this.WBNB.balanceOf(this.owner.address);

      const depositAmount = ethers.utils.parseEther("3")
      await this.investor.deposit(
        this.owner.address,
        1,
        this.WBNB.address,
        depositAmount.toString(),
        { gasPrice: 21e9 }
      );

      const wbnbBalAfter = await this.WBNB.balanceOf(this.owner.address);

      expect(
        BigNumber.from(wbnbBalBefore).eq(BigNumber.from(wbnbBalAfter).add(BigNumber.from(depositAmount)))
      ).to.eq(true);
    });
  })

  describe("withdraw() function test", function () {
    it("should success", async function () {
      const wbnbBalBefore = await this.WBNB.balanceOf(this.owner.address);

      await this.investor.withdraw(
        this.owner.address,
        1,
        this.WBNB.address,
        { gasPrice: 21e9 }
      );

      const wbnbBalAfter = await this.WBNB.balanceOf(this.owner.address);

      expect(
        BigNumber.from(wbnbBalAfter).gte(BigNumber.from(wbnbBalBefore))
      ).to.eq(true);
    });
  })
});