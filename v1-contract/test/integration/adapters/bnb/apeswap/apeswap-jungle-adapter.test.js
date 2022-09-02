const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const unlockAccount = async (address) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return hre.ethers.provider.getSigner(address);
};

describe("ApeswapJungleAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    const [owner, alice, bob, tom] = await ethers.getSigners();

    const performanceFee = 50;
    const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const stakeToken = "0x004f72d474ee262701205e3637b4367594efb11d"; // LGX-BUSD
    const rewardToken = "0x9096b4309224d751fcb43d7eb178dcffc122ad15"; // LGX token
    const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address

    this.alice = alice;
    this.owner = owner;
    this.bob = bob;
    this.tom = tom;
    this.aliceAddr = alice.address;
    this.bobAddr = bob.address;
    this.tomAddr = tom.address;
    this.strategy = "0xc81af2222ac6ec0f3ec08b875df25326b40e7a76"; // BEP20RewardApeV4
    this.apeRouter = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7";
    this.accTokenPerShare = BigNumber.from(0);

    // Deploy Apeswap Banana Adapter contract
    const ApeBananaAdapter = await ethers.getContractFactory("ApeswapJungleAdapter");
    this.aAdapter = await ApeBananaAdapter.deploy(
      this.strategy,
      stakeToken,
      rewardToken,
      this.apeRouter,
      "Apeswap Jungle Adapter"
    );
    await this.aAdapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    const Lib = await ethers.getContractFactory("HedgepieLibrary");
    const lib = await Lib.deploy();

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory("HedgepieInvestor", {
      libraries: { HedgepieLibrary: lib.address },
    });
    this.investor = await investorFactory.deploy(this.ybNft.address, swapRouter, wbnb);

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory("HedgepieAdapterManager");
    this.adapterManager = await adapterManager.deploy();

    // set investor
    await this.aAdapter.setInvestor(this.investor.address);
    await this.investor.setTreasury(this.owner.address);

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint([10000], [stakeToken], [this.aAdapter.address], performanceFee, "test tokenURI1");

    // tokenID: 2
    await this.ybNft.mint([10000], [stakeToken], [this.aAdapter.address], performanceFee, "test tokenURI2");

    // Add Venus Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.aAdapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);

    // Set investor in vAdapter
    await this.aAdapter.setInvestor(this.investor.address);

    await this.aAdapter.setPath(rewardToken, wbnb, [rewardToken, busd, wbnb]);
    await this.aAdapter.setPath(wbnb, rewardToken, [wbnb, busd, rewardToken]);
    await this.aAdapter.setPath(wbnb, busd, [wbnb, busd]);
    await this.aAdapter.setPath(busd, wbnb, [busd, wbnb]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", this.strategy);
    console.log("ApeswapJungleAdapter: ", this.aAdapter.address);

    this.rewardToken = await ethers.getContractAt("VBep20Interface", rewardToken);

    this.increaseBlocks = async () => {
      for (let i = 0; i < 20; i++) {
        await ethers.provider.send("evm_mine", []);
      }
    };
  });

  describe("deposit function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // deposit to nftID: 3
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor.connect(this.owner).depositBNB(this.owner.address, 3, depositAmount.toString(), {
          gasPrice: 21e9,
          value: depositAmount,
        })
      ).to.be.revertedWith("Error: nft tokenId is invalid");
    });

    it("(2)should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.depositBNB(this.owner.address, 1, depositAmount.toString(), {
          gasPrice: 21e9,
          value: depositAmount,
        })
      ).to.be.revertedWith("Error: Amount can not be 0");
    });

    it("(3) deposit should success for alice", async function () {
      const depositAmount = ethers.utils.parseEther("10");
      await expect(
        this.investor.connect(this.alice).depositBNB(this.aliceAddr, 1, depositAmount, {
          gasPrice: 21e9,
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositBNB")
        .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

      const userInfo = await this.investor.userInfo(this.aliceAddr, this.ybNft.address, 1);
      const depositAmount1 = Number(userInfo) / Math.pow(10, 18);
      expect(depositAmount1).to.eq(10);

      const aliceAdapterInfos = await this.investor.userAdapterInfos(this.aliceAddr, 1, this.aAdapter.address);
      expect(BigNumber.from(aliceAdapterInfos.amount).gt(0)).to.eq(true);

      const adapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
      expect(BigNumber.from(adapterInfos.totalStaked).sub(BigNumber.from(aliceAdapterInfos.amount))).to.eq(0);

      const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(this.aliceAddr, 1);
      expect(BigNumber.from(aliceWithdrable)).to.eq(BigNumber.from(aliceAdapterInfos.amount));

      // Check accTokenPerShare Info
      expect(BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare)).to.eq(
        BigNumber.from(this.accTokenPerShare)
      );

      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
    });

    it("(4) deposit should success for bob", async function () {
      await this.increaseBlocks();

      const depositAmount = ethers.utils.parseEther("20");
      const beforeAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
      const aliceAdapterInfos = await this.investor.userAdapterInfos(this.aliceAddr, 1, this.aAdapter.address);

      await expect(
        this.investor.connect(this.bob).depositBNB(this.bobAddr, 1, depositAmount, {
          gasPrice: 21e9,
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositBNB")
        .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

      const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(20);

      const bobAdapterInfos = await this.investor.userAdapterInfos(this.bobAddr, 1, this.aAdapter.address);
      expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

      const afterAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
      expect(BigNumber.from(afterAdapterInfos.totalStaked).gt(beforeAdapterInfos.totalStaked)).to.eq(true);
      expect(BigNumber.from(afterAdapterInfos.totalStaked).sub(aliceAdapterInfos.amount)).to.eq(
        BigNumber.from(bobAdapterInfos.amount)
      );

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
      expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(bobAdapterInfos.amount));

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare).gt(
          BigNumber.from(this.accTokenPerShare)
        )
      ).to.eq(true);

      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
    });

    it("(5) deposit should success for tom", async function () {
      await this.increaseBlocks();

      const depositAmount = ethers.utils.parseEther("30");
      const beforeAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);

      await expect(
        this.investor.connect(this.tom).depositBNB(this.tomAddr, 1, depositAmount, {
          gasPrice: 21e9,
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositBNB")
        .withArgs(this.tomAddr, this.ybNft.address, 1, depositAmount);

      const tomInfo = await this.investor.userInfo(this.tomAddr, this.ybNft.address, 1);
      const tomDeposit = Number(tomInfo) / Math.pow(10, 18);
      expect(tomDeposit).to.eq(30);

      const tomAdapterInfos = await this.investor.userAdapterInfos(this.tomAddr, 1, this.aAdapter.address);
      expect(BigNumber.from(tomAdapterInfos.amount).gt(0)).to.eq(true);

      const afterAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
      expect(BigNumber.from(afterAdapterInfos.totalStaked).gt(beforeAdapterInfos.totalStaked)).to.eq(true);
      expect(BigNumber.from(afterAdapterInfos.totalStaked).sub(tomAdapterInfos.amount)).to.eq(
        BigNumber.from(beforeAdapterInfos.totalStaked)
      );

      const tomWithdrable = await this.aAdapter.getWithdrawalAmount(this.tomAddr, 1);
      expect(BigNumber.from(tomWithdrable)).to.eq(BigNumber.from(tomAdapterInfos.amount));

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare).gt(
          BigNumber.from(this.accTokenPerShare)
        )
      ).to.eq(true);

      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
    });
  });

  describe("withdrawBNB() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(this.investor.withdrawBNB(this.owner.address, 3, { gasPrice: 21e9 })).to.be.revertedWith(
        "Error: nft tokenId is invalid"
      );
    });

    it("(2)should receive the BNB successfully after withdraw function for alice", async function () {
      await this.increaseBlocks();

      // withdraw from nftId: 1
      const beforeBNB = await ethers.provider.getBalance(this.aliceAddr);

      await expect(this.investor.connect(this.alice).withdrawBNB(this.aliceAddr, 1, { gasPrice: 21e9 })).to.emit(
        this.investor,
        "WithdrawBNB"
      );

      const afterBNB = await ethers.provider.getBalance(this.aliceAddr);
      expect(BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))).to.eq(true);

      const aliceInfo = await this.investor.userInfo(this.aliceAddr, this.ybNft.address, 1);
      expect(aliceInfo).to.eq(BigNumber.from(0));

      const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(this.aliceAddr, 1);
      expect(BigNumber.from(aliceWithdrable)).to.eq(BigNumber.from(0));

      const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(20);

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
      expect(BigNumber.from(bobWithdrable).gt(0)).to.eq(true);

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare).gt(
          BigNumber.from(this.accTokenPerShare)
        )
      ).to.eq(true);

      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
    });

    it("(3)should receive the BNB successfully after withdraw function for bob", async function () {
      await this.increaseBlocks();

      // withdraw from nftId: 1
      const beforeBNB = await ethers.provider.getBalance(this.bobAddr);

      await expect(this.investor.connect(this.bob).withdrawBNB(this.bobAddr, 1, { gasPrice: 21e9 })).to.emit(
        this.investor,
        "WithdrawBNB"
      );

      const afterBNB = await ethers.provider.getBalance(this.bobAddr);

      expect(BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))).to.eq(true);

      const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
      expect(bobInfo).to.eq(BigNumber.from(0));

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
      expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(0));

      const tomInfo = await this.investor.userInfo(this.tomAddr, this.ybNft.address, 1);
      const tomDeposit = Number(tomInfo) / Math.pow(10, 18);
      expect(tomDeposit).to.eq(30);

      const tomWithdrable = await this.aAdapter.getWithdrawalAmount(this.tomAddr, 1);
      expect(BigNumber.from(tomWithdrable).gt(0)).to.eq(true);

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare).gt(
          BigNumber.from(this.accTokenPerShare)
        )
      ).to.eq(true);

      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
    });

    it("(4)should receive the BNB successfully after withdraw function for tom", async function () {
      await this.increaseBlocks();

      // withdraw from nftId: 1
      const beforeBNB = await ethers.provider.getBalance(this.tomAddr);

      await expect(this.investor.connect(this.tom).withdrawBNB(this.tomAddr, 1, { gasPrice: 21e9 })).to.emit(
        this.investor,
        "WithdrawBNB"
      );

      const afterBNB = await ethers.provider.getBalance(this.tomAddr);

      expect(BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))).to.eq(true);

      const tomInfo = await this.investor.userInfo(this.tomAddr, this.ybNft.address, 1);
      expect(tomInfo).to.eq(BigNumber.from(0));

      const tomWithdrable = await this.aAdapter.getWithdrawalAmount(this.tomAddr, 1);
      expect(tomWithdrable).to.eq(0);

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare).gt(
          BigNumber.from(this.accTokenPerShare)
        )
      ).to.eq(true);

      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
    });
  });
});
