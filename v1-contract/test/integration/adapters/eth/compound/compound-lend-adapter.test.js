const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const unlockAccount = async (address) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return hre.ethers.provider.getSigner(address);
};

const forkNetwork = async () => {
  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: "https://rpc.ankr.com/eth",
        },
      },
    ],
  });
};

describe("CompoundLendAdapterEth Integration Test", function () {
  before("Deploy contract", async function () {
    await forkNetwork();

    const [owner, alice, bob, tom, treasury] = await ethers.getSigners();

    const performanceFee = 100;
    const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const aave = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
    const strategy = "0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c"; // cAAVE Token
    const comptroller = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B"; // Compound comptroller
    const stakingToken = aave;

    this.performanceFee = performanceFee;
    this.weth = weth;
    this.aave = aave;

    this.owner = owner;
    this.alice = alice;
    this.bob = bob;
    this.tom = tom;
    this.sushiRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

    this.bobAddr = bob.address;
    this.aliceAddr = alice.address;
    this.tomAddr = tom.address;
    this.treasuryAddr = treasury.address;

    // Deploy CompoundLendAdapterEth contract
    const Lib = await ethers.getContractFactory("HedgepieLibraryEth");
    const lib = await Lib.deploy();
    const AaveFarmAdapter = await ethers.getContractFactory("CompoundLendAdapterEth", {
      libraries: {
        HedgepieLibraryEth: lib.address,
      },
    });

    this.adapter = await AaveFarmAdapter.deploy(
      strategy,
      comptroller,
      aave,
      this.sushiRouter,
      "COMPOUND::Lend::AAVE",
      weth
    );
    await this.adapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    // Deploy Adaptor Info contract
    const adapterInfo = await ethers.getContractFactory("HedgepieAdapterInfoEth");
    this.adapterInfo = await adapterInfo.deploy();
    await this.adapterInfo.setManager(this.adapter.address, true);

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory("HedgepieInvestorEth");
    this.investor = await investorFactory.deploy(this.ybNft.address, this.treasuryAddr, this.adapterInfo.address);

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory("HedgepieAdapterManagerEth");
    this.adapterManager = await adapterManager.deploy();

    // set investor
    await this.adapter.setInvestor(this.investor.address);

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint([10000], [stakingToken], [this.adapter.address], performanceFee, "test tokenURI1");

    // tokenID: 2
    await this.ybNft.mint([10000], [stakingToken], [this.adapter.address], performanceFee, "test tokenURI2");

    // Add Venus Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.adapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);
    await this.investor.setTreasury(this.owner.address);

    // Set investor in pancake adapter
    await this.adapter.setInvestor(this.investor.address);
    await this.adapter.setPath(this.weth, this.aave, [this.weth, this.aave]);
    await this.adapter.setPath(this.aave, this.weth, [this.aave, this.weth]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", strategy);
    console.log("Info: ", this.adapterInfo.address);
    console.log("AaveLendAdapterEth: ", this.adapter.address);

    this.lpContract = await ethers.getContractAt("VBep20Interface", stakingToken);
  });

  describe("depositETH function test", function () {
    it("(1) should be reverted when nft tokenId is invalid", async function () {
      // deposit to nftID: 3
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor.connect(this.owner).depositETH(3, depositAmount.toString(), {
          gasPrice: 21e9,
          value: depositAmount,
        })
      ).to.be.revertedWith("Error: nft tokenId is invalid");
    });

    it("(2) should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(this.investor.depositETH(1, depositAmount.toString(), { gasPrice: 21e9 })).to.be.revertedWith(
        "Error: Insufficient ETH"
      );
    });

    it("(3) deposit should success for Alice", async function () {
      const depositAmount = ethers.utils.parseEther("10");
      await this.investor.connect(this.alice).depositETH(1, depositAmount, {
        gasPrice: 21e9,
        value: depositAmount,
      });

      const aliceInfo = (await this.adapter.userAdapterInfos(this.aliceAddr, 1)).invested;
      expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(10);

      const aliceAdapterInfos = await this.adapter.userAdapterInfos(this.aliceAddr, 1);
      const adapterInfos = await this.adapter.adapterInfos(1);
      expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(BigNumber.from(aliceAdapterInfos.amount));
    });

    it("(4) deposit should success for Bob", async function () {
      const beforeAdapterInfos = await this.adapter.adapterInfos(1);
      const depositAmount = ethers.utils.parseEther("10");

      await this.investor.connect(this.bob).depositETH(1, depositAmount, {
        gasPrice: 21e9,
        value: depositAmount,
      });

      await this.investor.connect(this.bob).depositETH(1, depositAmount, {
        gasPrice: 21e9,
        value: depositAmount,
      });

      const bobInfo = (await this.adapter.userAdapterInfos(this.bobAddr, 1)).invested;
      expect(Number(bobInfo) / Math.pow(10, 18)).to.eq(20);

      const bobAdapterInfos = await this.adapter.userAdapterInfos(this.bobAddr, 1);
      expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

      const afterAdapterInfos = await this.adapter.adapterInfos(1);

      expect(BigNumber.from(afterAdapterInfos.totalStaked).gt(beforeAdapterInfos.totalStaked)).to.eq(true);
    });

    it("(5) test pendingReward function and protocol-fee", async function () {
      // wait 1 day
      await ethers.provider.send("evm_increaseTime", [3600 * 24]);
      await ethers.provider.send("evm_mine", []);

      const pending = await this.investor.pendingReward(1, this.aliceAddr);
      expect(BigNumber.from(pending).gt(0)).to.be.eq(true);
    });

    it("(6) test TVL & participants", async function () {
      const nftInfo = await this.adapterInfo.adapterInfo(1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(30) &&
        expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq("2");
    });
  });

  describe("withdrawETH() function test", function () {
    it("(1) revert when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(this.investor.connect(this.owner).withdrawETH(3, { gasPrice: 21e9 })).to.be.revertedWith(
        "Error: nft tokenId is invalid"
      );
    });

    it("(2) should receive the ETH successfully after withdraw function for Alice", async function () {
      // withdraw from nftId: 1
      const beforeETH = await ethers.provider.getBalance(this.aliceAddr);

      await this.investor.connect(this.alice).withdrawETH(1, { gasPrice: 21e9 });

      const afterETH = await ethers.provider.getBalance(this.aliceAddr);

      expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

      const aliceInfo = (await this.adapter.userAdapterInfos(this.aliceAddr, 1)).invested;
      expect(aliceInfo).to.eq(BigNumber.from(0));

      const bobInfo = (await this.adapter.userAdapterInfos(this.bobAddr, 1)).invested;
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(20);
    });

    it("(3) test TVL & participants after Alice withdraw", async function () {
      const nftInfo = await this.adapterInfo.adapterInfo(1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(20) &&
        expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq("1");
    });

    it("(4) should receive the ETH successfully after withdraw function for Bob", async function () {
      // withdraw from nftId: 1
      const beforeETH = await ethers.provider.getBalance(this.bobAddr);

      await this.investor.connect(this.bob).withdrawETH(1, { gasPrice: 21e9 });

      const afterETH = await ethers.provider.getBalance(this.bobAddr);

      expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

      const bobInfo = (await this.adapter.userAdapterInfos(this.bobAddr, 1)).invested;
      expect(bobInfo).to.eq(BigNumber.from(0));
    });

    it("(5) test TVL & participants after Alice & Bob withdraw", async function () {
      const nftInfo = await this.adapterInfo.adapterInfo(1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(0) &&
        expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq("0");
    });
  });
});
