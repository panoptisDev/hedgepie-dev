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
    const [owner, alice, bob] = await ethers.getSigners();

    this.alice = alice;
    this.owner = owner;
    this.bob = bob;
    this.strategy = vbusd;

    // Deploy Venus Adapter contract
    const VenusAdapter = await ethers.getContractFactory("VenusLendAdapter");
    this.vAdapter = await VenusAdapter.deploy(this.strategy, busd, vbusd, "Venus BUSD lend adapter");
    await this.vAdapter.deployed();

    // Deploy YBNFT contract
    ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint([10000], [busd], [this.vAdapter.address], performanceFee, "test tokenURI1");

    // tokenID: 2
    await this.ybNft.mint([10000], [busd], [this.vAdapter.address], performanceFee, "test tokenURI2");

    // Deploy Investor contract
    investorFactory = await ethers.getContractFactory("HedgepieInvestor");
    this.investor = await investorFactory.deploy(this.ybNft.address, swapRouter, wbnb);

    // Deploy Adaptor Manager contract
    adapterManagerFactory = await ethers.getContractFactory("HedgepieAdapterManager");
    this.adapterManager = await adapterManagerFactory.deploy();

    // Add Venus Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.vAdapter.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set investor in vAdapter
    await this.vAdapter.setInvestor(this.investor.address);

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

    await this.vAdapter.setPath(busd, wbnb, [busd, wbnb]);
    await this.vAdapter.setPath(wbnb, busd, [wbnb, busd]);

    // charge initial WBNB funds
    await this.WBNB.connect(this.whaleWallet).transfer(this.owner.address, ethers.utils.parseEther("3").toString());

    await this.WBNB.connect(this.whaleWallet).transfer(this.alice.address, ethers.utils.parseEther("3").toString());

    await this.WBNB.connect(this.whaleWallet).transfer(this.bob.address, ethers.utils.parseEther("3").toString());

    // Approve investor to move wbnb
    await this.WBNB.approve(this.investor.address, ethers.constants.MaxUint256);
  });

  describe("should set correct state variable", function () {
    it("(1) Check strategy address", async function () {
      expect(await this.vAdapter.strategy()).to.eq(this.strategy);
    });

    it("(2) Check owner wallet", async function () {
      expect(await this.vAdapter.owner()).to.eq(this.owner.address);
    });

    it("(3) Check AdapterManager address in Investor contract", async function () {
      expect(await this.investor.adapterManager()).to.eq(this.adapterManager.address);
    });

    it("(4) Check Investor address in AdapterManager contract", async function () {
      expect(await this.adapterManager.investor()).to.eq(this.investor.address);
    });

    it("(5) Check owner wallet", async function () {
      expect(await this.vAdapter.owner()).to.eq(this.owner.address);
    });

    it("(6) Check AdapterInfo of YBNFT", async function () {
      const response = await this.ybNft.getAdapterInfo(1);
      expect(response[0].allocation).to.eq(10000) &&
        expect(response[0].token).to.eq(busd) &&
        expect(response[0].addr).to.eq(this.vAdapter.address);
    });
  });

  describe("deposit() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // deposit to nftID: 3
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor.depositBNB(this.owner.address, 3, depositAmount.toString(), {
          gasPrice: 21e9,
          value: depositAmount.toString(),
        })
      ).to.be.revertedWith("Error: nft tokenId is invalid");
    });

    it("(2)should be reverted when caller is not matched", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor.depositBNB(this.alice.address, 1, depositAmount.toString(), {
          gasPrice: 21e9,
          value: depositAmount.toString(),
        })
      ).to.be.revertedWith("Error: Caller is not matched");
    });

    it("(3)should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.depositBNB(this.owner.address, 1, depositAmount.toString(), {
          gasPrice: 21e9,
          value: depositAmount.toString(),
        })
      ).to.be.revertedWith("Error: Amount can not be 0");
    });

    it("(4)should success 1 time and receive the vToken successfully after deposit function", async function () {
      const depositAmount = ethers.utils.parseEther("1");

      await this.investor.depositBNB(this.owner.address, 1, depositAmount, {
        gasPrice: 21e9,
        value: depositAmount.toString(),
      });

      expect(BigNumber.from(await this.vBUSD.balanceOf(this.investor.address)).gt(0)).to.eq(true);
    });

    // it("(5)should success multiple times", async function () {
    //   // deposit to nftID: 1
    //   let wbnbBalBefore = await ethers.provider.getBalance(this.owner.address);

    //   const depositAmount = ethers.utils.parseEther("1");
    //   await this.investor.depositBNB(this.owner.address, 1, depositAmount.toString(), {
    //     gasPrice: 21e9,
    //     value: depositAmount.toString(),
    //   });

    //   let wbnbBalAfter = await ethers.provider.getBalance(this.owner.address);

    //   console.log(wbnbBalBefore.toString(), BigNumber.from(wbnbBalAfter).add(BigNumber.from(depositAmount)).toString());

    //   expect(BigNumber.from(wbnbBalBefore).eq(BigNumber.from(wbnbBalAfter).add(BigNumber.from(depositAmount)))).to.eq(
    //     true
    //   );

    //   // deposit to nftID: 2
    //   wbnbBalBefore = await ethers.provider.getBalance(this.owner.address);

    //   await this.investor.depositBNB(this.owner.address, 2, depositAmount.toString(), {
    //     gasPrice: 21e9,
    //     value: depositAmount.toString(),
    //   });

    //   wbnbBalAfter = await this.WBNB.balanceOf(this.owner.address);

    //   expect(BigNumber.from(wbnbBalBefore).eq(BigNumber.from(wbnbBalAfter).add(BigNumber.from(depositAmount)))).to.eq(
    //     true
    //   );
    // });
  });

  describe("withdraw() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(this.investor.withdrawBNB(this.owner.address, 3, { gasPrice: 21e9 })).to.be.revertedWith(
        "Error: nft tokenId is invalid"
      );
    });

    it("(2)should be reverted when caller is not matched", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("1");
      await expect(this.investor.withdrawBNB(this.alice.address, 1, { gasPrice: 21e9 })).to.be.revertedWith(
        "Error: Caller is not matched"
      );
    });

    it("(3)should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.connect(this.bob).depositBNB(this.bob.address, 1, depositAmount.toString(), {
          gasPrice: 21e9,
        })
      ).to.be.revertedWith("Error: Amount can not be 0");
    });
    it("(4)should receive the WBNB successfully after withdraw function", async function () {
      // withdraw from nftId: 1
      let wbnbBalBefore = await this.WBNB.balanceOf(this.owner.address);

      await this.investor.withdrawBNB(this.owner.address, 1, { gasPrice: 21e9 });

      let wbnbBalAfter = await this.WBNB.balanceOf(this.owner.address);

      expect(BigNumber.from(wbnbBalAfter).gte(BigNumber.from(wbnbBalBefore))).to.eq(true);

      // withdraw from nftId: 2
      wbnbBalBefore = await this.WBNB.balanceOf(this.owner.address);

      await this.investor.withdrawBNB(this.owner.address, 2, { gasPrice: 21e9 });

      wbnbBalAfter = await this.WBNB.balanceOf(this.owner.address);

      expect(BigNumber.from(wbnbBalAfter).gte(BigNumber.from(wbnbBalBefore))).to.eq(true);
    });
  });
});
