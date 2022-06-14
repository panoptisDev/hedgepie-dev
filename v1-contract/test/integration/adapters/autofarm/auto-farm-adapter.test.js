const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const unlockAccount = async (address) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return hre.ethers.provider.getSigner(address);
};

describe("AutoFarmAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    const [owner, alice, bob, carol] = await ethers.getSigners();

    const performanceFee = 50;
    this.wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    this.Banana = "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95";
    this.whaleAddr = "0x41772edd47d9ddf9ef848cdb34fe76143908c7ad";
    this.strategy = "0x0895196562C7868C5Be92459FaE7f877ED450452"; // MasterChef
    this.swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks router address
    this.rewardToken = "0xa184088a740c695E156F91f5cC086a06bb78b827"; // AUTOv2 token
    this.lpToken = "0x0ed7e52944161450477ee417de9cd3a859b14fd0"; // WBNB-Cake LP
    this.poolID = 619;

    this.alice = alice;
    this.bob = bob;
    this.carol = carol;
    this.owner = owner;
    this.apeRouter = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7";

    // Deploy Apeswap LP Adapter contract
    const AutoFarmAdapter = await ethers.getContractFactory("AutoFarmAdapter");
    this.aAdapter = await AutoFarmAdapter.deploy(
      this.strategy,
      this.lpToken,
      this.rewardToken,
      this.swapRouter,
      this.poolID,
      [this.wbnb, "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"], //WBNB & Cake
      "WBNB-Cake LP Adapter"
    );
    await this.aAdapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory("HedgepieInvestor");
    this.investor = await investorFactory.deploy(
      this.ybNft.address,
      this.swapRouter,
      this.wbnb
    );

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory(
      "HedgepieAdapterManager"
    );
    this.adapterManager = await adapterManager.deploy();

    // set investor
    await this.aAdapter.setInvestor(this.investor.address);

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint(
      [10000],
      [this.lpToken],
      [this.aAdapter.address],
      performanceFee,
      "test tokenURI1"
    );

    // tokenID: 2
    await this.ybNft.mint(
      [10000],
      [this.lpToken],
      [this.aAdapter.address],
      performanceFee,
      "test tokenURI2"
    );

    // Add Venus Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.aAdapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);

    // Set investor in vAdapter
    await this.aAdapter.setInvestor(this.investor.address);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", this.strategy);
    console.log("AutoFarmAdapter: ", this.aAdapter.address);

    // this.whaleWallet = await unlockAccount(whaleAddr);
    this.lpContract = await ethers.getContractAt(
      "VBep20Interface",
      this.lpToken
    );
  });

  describe("depositBNB function test", function () {
    it("(1) should be reverted when nft tokenId is invalid", async function () {
      // deposit to nftID: 3
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor
          .connect(this.owner)
          .depositBNB(this.owner.address, 3, depositAmount.toString(), {
            gasPrice: 21e9,
            value: depositAmount,
          })
      ).to.be.revertedWith("Error: nft tokenId is invalid");
    });

    it("(2) should be reverted when caller is not matched", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor.depositBNB(
          this.alice.address,
          1,
          depositAmount.toString(),
          { gasPrice: 21e9 }
        )
      ).to.be.revertedWith("Error: Caller is not matched");
    });

    it("(3) should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.depositBNB(
          this.owner.address,
          1,
          depositAmount.toString(),
          { gasPrice: 21e9 }
        )
      ).to.be.revertedWith("Error: Amount can not be 0");
    });

    it("(4) deposit should success", async function () {
      const depositAmount = ethers.utils.parseEther("10");
      await this.investor
        .connect(this.alice)
        .depositBNB(this.alice.address, 1, depositAmount, {
          gasPrice: 21e9,
          value: depositAmount,
        });

      const userInfo = await this.investor.userInfo(
        this.alice.address,
        this.ybNft.address,
        1
      );

      expect(Number(userInfo) / Math.pow(10, 18)).to.eq(10);
    });
  });

  describe("withdrawBNB() function test", function () {
    it("(1) should be reverted when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(
        this.investor.withdrawBNB(this.owner.address, 3, { gasPrice: 21e9 })
      ).to.be.revertedWith("Error: nft tokenId is invalid");
    });

    it("(2) should be reverted when caller is not matched", async function () {
      // deposit to nftID: 1
      await expect(
        this.investor.withdrawBNB(this.alice.address, 1, { gasPrice: 21e9 })
      ).to.be.revertedWith("Error: Caller is not matched");
    });

    it("(3) should receive the BNB successfully after withdraw function", async function () {
      // withdraw from nftId: 1
      const aliceAddr = this.alice.address;
      const beforeBNB = await ethers.provider.getBalance(aliceAddr);

      await this.investor
        .connect(this.alice)
        .withdrawBNB(aliceAddr, 1, { gasPrice: 21e9 });

      const afterBNB = await ethers.provider.getBalance(aliceAddr);

      expect(BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))).to.eq(
        true
      );

      const userInfo = await this.investor.userInfo(
        aliceAddr,
        this.ybNft.address,
        1
      );

      expect(Number(userInfo) / Math.pow(10, 18)).to.eq(0);
    });
  });
});
