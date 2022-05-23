const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const unlockAccount = async (address) => {
    await hre.network.provider.send("hardhat_impersonateAccount", [address]);
    return hre.ethers.provider.getSigner(address);
};

describe("ApeswapLPAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    const [owner, alice] = await ethers.getSigners();

    const performanceFee = 50;
    const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address

    this.alice = alice;
    this.owner = owner;
    this.WHALE = "0xD719085662A26971c43881C008639bb8AC1Babba";
    this.strategy = "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9"; // MasterApe
    this.lpToken = "0x51e6D27FA57373d8d4C256231241053a70Cb1d93" // BUSD-WBNB LP
    this.banana = "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95";

    // Deploy Apeswap LP Adapter contract
    const ApeLPAdapter = await ethers.getContractFactory("ApeswapLPAdapter");
    this.aAdapter = await ApeLPAdapter.deploy(
      3, // pid
      this.strategy,
      this.lpToken,
      this.banana,
      "BUSD-WBNB LP Adapter"
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
    console.log("ApeswapLPAdapter: ", this.aAdapter.address);

    this.whaleWallet = await unlockAccount(this.WHALE);
    
    this.lpContract = await ethers.getContractAt("VBep20Interface", this.lpToken);
    await this.lpContract.connect(this.whaleWallet).approve(this.investor.address, ethers.utils.parseUnits("100"));
  });

  describe("deposit function test", function() {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
        // deposit to nftID: 3
        const depositAmount = ethers.utils.parseEther("1");
        await expect(
          this.investor.connect(this.owner).deposit(
            this.owner.address,
            3,
            this.lpToken,
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
            this.lpToken,
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
            this.lpToken,
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
          this.lpToken,
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
            this.lpToken,
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
            this.lpToken,
            { gasPrice: 21e9 }
          )
        ).to.be.revertedWith("Error: Caller is not matched")
      });
  
      it("(3)should receive the LP successfully after withdraw function", async function () {
        const userInfo = await this.investor.userInfo(this.WHALE, this.ybNft.address, 1);
        const depositAmount1 = Number(userInfo) / Math.pow(10, 18);

        // withdraw from nftId: 1
        let lpBalBefore = await this.lpContract.balanceOf(this.owner.address);
  
        await this.investor.connect(this.whaleWallet).withdraw(
          this.WHALE,
          1,
          this.lpToken,
          { gasPrice: 21e9 }
        );
  
        let lpBalAfter = await this.lpContract.balanceOf(this.owner.address);
  
        expect(
          BigNumber.from(lpBalAfter).gte(BigNumber.from(lpBalBefore))
        ).to.eq(true);
      }).timeout(50000000);
    });
});