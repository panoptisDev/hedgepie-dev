const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const unlockAccount = async (address) => {
    await hre.network.provider.send("hardhat_impersonateAccount", [address]);
    return hre.ethers.provider.getSigner(address);
};

describe("ApeswapPoolAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    const [owner, alice] = await ethers.getSigners();

    const performanceFee = 50;
    const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address

    this.alice = alice;
    this.owner = owner;
    this.WHALE = "0x17A14b2a8bAffd1222e9079c1f9a81f7Bf190F33";
    this.strategy = "0xd0378c1b37D530a00E91764A7a41EfEB3d6A5fbC"; // BEP20RewardApeV4
    this.banana = "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95";
    this.reward = "0x7837fd820bA38f95c54D6dAC4ca3751b81511357"; // DOSE token

    // Deploy Apeswap Banana Adapter contract
    const ApeBananaAdapter = await ethers.getContractFactory("ApeswapPoolAdapter");
    this.aAdapter = await ApeBananaAdapter.deploy(
      this.strategy,
      this.banana,
      this.reward,
      "Apeswap Banana Adapter"
    );
    await this.aAdapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory("HedgepieInvestor");
    this.investor = await investorFactory.deploy(
      this.ybNft.address,
      swapRouter,
      wbnb
    );

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory("HedgepieAdapterManager");
    this.adapterManager = await adapterManager.deploy();

    // set investor
    await this.aAdapter.setInvestor(this.investor.address);

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint(
        [10000],
        [this.banana],
        [this.aAdapter.address],
        performanceFee,
        "test tokenURI1"
    );
  
    // tokenID: 2
    await this.ybNft.mint(
        [10000],
        [this.banana],
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
    console.log("ApeswapPoolAdapter: ", this.aAdapter.address);

    this.whaleWallet = await unlockAccount(this.WHALE);
    
    this.bnContract = await ethers.getContractAt("VBep20Interface", this.banana);
    this.rwContract = await ethers.getContractAt("VBep20Interface", this.reward);
    await this.bnContract.connect(this.whaleWallet).approve(this.investor.address, ethers.utils.parseUnits("100"));
  });

  describe("deposit function test", function() {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
        // deposit to nftID: 3
        const depositAmount = ethers.utils.parseEther("1");
        await expect(
          this.investor.connect(this.owner).deposit(
            this.owner.address,
            3,
            this.banana,
            depositAmount.toString(),
            { gasPrice: 21e9 }
          )
        ).to.be.revertedWith("Error: nft tokenId is invalid")
    });

    it("(2)should be reverted when caller is not matched", async function () {
        // deposit to nftID: 1
        const depositAmount = ethers.utils.parseEther("1");
        await expect(
          this.investor.deposit(
            this.alice.address,
            1,
            this.banana,
            depositAmount.toString(),
            { gasPrice: 21e9 }
          )
        ).to.be.revertedWith("Error: Caller is not matched")
    });

    it("(3)should be reverted when amount is 0", async function () {
        // deposit to nftID: 1
        const depositAmount = ethers.utils.parseEther("0")
        await expect(
          this.investor.deposit(
            this.owner.address,
            1,
            this.banana,
            depositAmount.toString(),
            { gasPrice: 21e9 }
          )
        ).to.be.revertedWith("Error: Amount can not be 0")
    });

    it("(4) deposit should success", async function () {
        const depositAmount = ethers.utils.parseEther("10")
        await this.investor.connect(this.whaleWallet).deposit(
          this.WHALE,
          1,
          this.banana,
          depositAmount,
          { gasPrice: 21e9 }
        );
        
        const userInfo = await this.investor.userInfo(this.WHALE, this.ybNft.address, 1);
        const depositAmount1 = Number(userInfo) / Math.pow(10, 18);
        expect(depositAmount1).to.eq(10);
    }).timeout(50000000);
  });

  describe("withdraw() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
        // withdraw to nftID: 3
        await expect(
          this.investor.withdraw(
            this.owner.address,
            3,
            this.banana,
            { gasPrice: 21e9 }
          )
        ).to.be.revertedWith("Error: nft tokenId is invalid")
      });
  
      it("(2)should be reverted when caller is not matched", async function () {
        // deposit to nftID: 1
        await expect(
          this.investor.withdraw(
            this.alice.address,
            1,
            this.banana,
            { gasPrice: 21e9 }
          )
        ).to.be.revertedWith("Error: Caller is not matched")
      });
  
      it("(3)should receive the DOSE & Banana token successfully after withdraw function", async function () {
        // withdraw from nftId: 1
        let bananaBalBefore = await this.rwContract.balanceOf(this.owner.address);
  
        await this.investor.connect(this.whaleWallet).withdraw(
          this.WHALE,
          1,
          this.banana,
          { gasPrice: 21e9 }
        );
  
        let bananaBalAfter = await this.rwContract.balanceOf(this.owner.address);
  
        expect(
          BigNumber.from(bananaBalAfter).gte(BigNumber.from(bananaBalBefore))
        ).to.eq(true);
      });
    });
});