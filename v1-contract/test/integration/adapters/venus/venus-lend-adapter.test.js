const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const E18 = BigNumber.from(10).pow(18);

const unlockAccount = async (address) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return hre.ethers.provider.getSigner(address);
};

describe("VenusAdapter Integration Test", function () {
  const performanceFee = 50;
  const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address
  const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
  const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
  const vbusd = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
  const WHALE = "0x41772edd47d9ddf9ef848cdb34fe76143908c7ad";

  before("Deploy contract", async function () {
    const [owner, alice] = await ethers.getSigners();

    this.alice = alice;
    this.owner = owner;
    this.strategy = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";

    // Deploy Venus Adapter contract
    const VenusAdapter = await ethers.getContractFactory("VenusLendAdapter");
    this.vAdapter = await VenusAdapter.deploy(
      this.strategy,
      "0x0000000000000000000000000000000000000001"
    );
    await this.vAdapter.deployed();

    // Deploy YBNFT contract
    ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    // Mint NFTs
    await this.ybNft.mint(
      [10000],
      [busd],
      [this.vAdapter.address],
      performanceFee
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
    await this.adapterManager.addAdapter(this.vAdapter.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set investory to vAdaptor
    this.vAdapter.setInvestor(this.investor.address);

    console.log("YBNFT: ", this.ybNft.address);
    console.log("Investor: ", this.investor.address);
    console.log("VenusAdapter: ", this.vAdapter.address);
    console.log("AdapterManager: ", this.adapterManager.address);
    console.log("Strategy: ", this.strategy);
    console.log("Owner: ", this.owner.address);

    this.whaleWallet = await unlockAccount(WHALE);
    this.vBUSD = await ethers.getContractAt("VBep20Interface", vbusd);
    this.BUSD = await ethers.getContractAt("VBep20Interface", busd);
    this.WBNB = await ethers.getContractAt("VBep20Interface", wbnb);

    await this.BUSD.connect(this.whaleWallet).transfer(
      this.owner.address,
      ethers.utils.parseEther("10000").toString()
    );

    await this.WBNB.connect(this.whaleWallet).transfer(
      this.owner.address,
      ethers.utils.parseEther("10").toString()
    );

    // Approve investor to move wbnb
    await this.WBNB.approve(this.investor.address, ethers.constants.MaxUint256);
  });

  describe("should set correct state variable", function () {
    it("(1) Check investor address", async function () {
      expect(await this.vAdapter.investor()).to.eq(this.investor.address);
    });

    it("(2) Check strategy address", async function () {
      expect(await this.vAdapter.strategy()).to.eq(this.strategy);
    });

    it("(3) Check owner wallet", async function () {
      expect(await this.vAdapter.owner()).to.eq(this.owner.address);
    });

    it("(4) Check AdapterManager address in Investor contract", async function () {
      expect(await this.investor.adapterManager()).to.eq(
        this.adapterManager.address
      );
    });

    it("(5) Check Investor address in AdapterManager contract", async function () {
      expect(await this.adapterManager.investor()).to.eq(this.investor.address);
    });

    it("(6) Check owner wallet", async function () {
      expect(await this.vAdapter.owner()).to.eq(this.owner.address);
    });

    it("(7) Check AdapterInfo of YBNFT", async function () {
      const response = await this.ybNft.getAdapterInfo(1);
      expect(response[0].allocation).to.eq(10000) &&
        expect(response[0].token).to.eq(busd) &&
        expect(response[0].addr).to.eq(this.vAdapter.address);
    });
  });

  it("should receive the vToken successfully after deposit function", async function () {
    await this.investor.deposit(
      this.owner.address,
      1,
      this.WBNB.address,
      ethers.utils.parseEther("10").toString(),
      { gasPrice: 21e9 }
    );

    expect(
      BigNumber.from(await this.vBUSD.balanceOf(this.investor.address)).gt(0)
    ).to.eq(true);
  });

  it("should receive the WBNB successfully after withdraw function", async function () {
    await this.investor.withdraw(
      this.owner.address,
      1,
      this.WBNB.address,
      (await this.vBUSD.balanceOf(this.investor.address)).toString(),
      { gasPrice: 21e9 }
    );

    expect(await this.vBUSD.balanceOf(this.investor.address)).to.eq(0);
  });
});
