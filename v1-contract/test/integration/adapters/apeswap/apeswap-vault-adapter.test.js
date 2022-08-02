const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

describe("ApeswapVaultAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    const [owner, alice, bob, tom] = await ethers.getSigners();

    const performanceFee = 50;
    const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
    const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const Banana = "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95";
    const lpToken = "0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914"; // BUSD-BANANA LP
    const apeRouter = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7";
    const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address

    this.alice = alice;
    this.owner = owner;
    this.bob = bob;
    this.tom = tom;
    this.aliceAddr = alice.address;
    this.bobAddr = bob.address;
    this.tomAddr = tom.address;
    this.strategy = "0x5711a833C943AD1e8312A9c7E5403d48c717e1aa"; // VaultApe
    this.vStrategy = "0x234101c6612115cAC7bDb74eE20F388BB95DB8cC";

    // Deploy Apeswap Banana Adapter contract
    const ApeVaultAdapter = await ethers.getContractFactory(
      "ApeswapVaultAdapter"
    );
    this.aAdapter = await ApeVaultAdapter.deploy(
      2, // PID
      this.strategy,
      this.vStrategy,
      lpToken,
      Banana,
      apeRouter,
      "Apeswap Vault Adapter"
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

    this.ctVStrategy = await ethers.getContractAt(
      "IVaultStrategy",
      this.vStrategy
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
      [lpToken],
      [this.aAdapter.address],
      performanceFee,
      "test tokenURI1"
    );

    // tokenID: 2
    await this.ybNft.mint(
      [10000],
      [lpToken],
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
    await this.aAdapter.setPath(Banana, wbnb, [Banana, wbnb]);
    await this.aAdapter.setPath(wbnb, Banana, [wbnb, Banana]);
    await this.aAdapter.setPath(wbnb, busd, [wbnb, busd]);
    await this.aAdapter.setPath(busd, wbnb, [busd, wbnb]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", this.strategy);
    console.log("ApeswapVaultAdapter: ", this.aAdapter.address);

    this.rewardToken = await ethers.getContractAt("VBep20Interface", Banana);
  });

  describe("deposit function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
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

    it("(2)should be reverted when caller is not matched", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor.depositBNB(
          this.alice.address,
          1,
          depositAmount.toString(),
          {
            gasPrice: 21e9,
            value: depositAmount,
          }
        )
      ).to.be.revertedWith("Error: Caller is not matched");
    });

    it("(3)should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.depositBNB(
          this.owner.address,
          1,
          depositAmount.toString(),
          {
            gasPrice: 21e9,
            value: depositAmount,
          }
        )
      ).to.be.revertedWith("Error: Amount can not be 0");
    });

    it("(4) deposit should success for alice", async function () {
      const depositAmount = ethers.utils.parseEther("10");
      await expect(
        this.investor
          .connect(this.alice)
          .depositBNB(this.aliceAddr, 1, depositAmount, {
            gasPrice: 21e9,
            value: depositAmount,
          })
      )
        .to.emit(this.investor, "DepositBNB")
        .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

      const userInfo = await this.investor.userInfo(
        this.aliceAddr,
        this.ybNft.address,
        1
      );
      const depositAmount1 = Number(userInfo) / Math.pow(10, 18);
      expect(depositAmount1).to.eq(10);

      const aliceAdapterInfos = await this.investor.userAdapterInfos(
        this.aliceAddr,
        1,
        this.aAdapter.address
      );
      expect(BigNumber.from(aliceAdapterInfos.amount).gt(0)).to.eq(true);

      const adapterInfos = await this.investor.adapterInfos(
        1,
        this.aAdapter.address
      );
      expect(
        BigNumber.from(adapterInfos.totalStaked).sub(
          BigNumber.from(aliceAdapterInfos.amount)
        )
      ).to.eq(0);

      const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.aliceAddr,
        1
      );
      expect(BigNumber.from(aliceWithdrable)).to.eq(
        BigNumber.from(aliceAdapterInfos.amount)
      );
    });

    it("(5) deposit should success for bob", async function () {
      const depositAmount = ethers.utils.parseEther("20");
      const beforeAdapterInfos = await this.investor.adapterInfos(
        1,
        this.aAdapter.address
      );
      const aliceAdapterInfos = await this.investor.userAdapterInfos(
        this.aliceAddr,
        1,
        this.aAdapter.address
      );

      await expect(
        this.investor
          .connect(this.bob)
          .depositBNB(this.bobAddr, 1, depositAmount, {
            gasPrice: 21e9,
            value: depositAmount,
          })
      )
        .to.emit(this.investor, "DepositBNB")
        .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

      const bobInfo = await this.investor.userInfo(
        this.bobAddr,
        this.ybNft.address,
        1
      );
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(20);

      const bobAdapterInfos = await this.investor.userAdapterInfos(
        this.bobAddr,
        1,
        this.aAdapter.address
      );
      expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

      const afterAdapterInfos = await this.investor.adapterInfos(
        1,
        this.aAdapter.address
      );
      expect(
        BigNumber.from(afterAdapterInfos.totalStaked).gt(
          beforeAdapterInfos.totalStaked
        )
      ).to.eq(true);
      expect(
        BigNumber.from(afterAdapterInfos.totalStaked).sub(
          aliceAdapterInfos.amount
        )
      ).to.eq(BigNumber.from(bobAdapterInfos.amount));

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.bobAddr,
        1
      );
      expect(BigNumber.from(bobWithdrable)).to.eq(
        BigNumber.from(bobAdapterInfos.amount)
      );
    });

    it("(6) deposit should success for tom", async function () {
      const depositAmount = ethers.utils.parseEther("30");
      const beforeAdapterInfos = await this.investor.adapterInfos(
        1,
        this.aAdapter.address
      );

      await expect(
        this.investor
          .connect(this.tom)
          .depositBNB(this.tomAddr, 1, depositAmount, {
            gasPrice: 21e9,
            value: depositAmount,
          })
      )
        .to.emit(this.investor, "DepositBNB")
        .withArgs(this.tomAddr, this.ybNft.address, 1, depositAmount);

      const tomInfo = await this.investor.userInfo(
        this.tomAddr,
        this.ybNft.address,
        1
      );
      const tomDeposit = Number(tomInfo) / Math.pow(10, 18);
      expect(tomDeposit).to.eq(30);

      const tomAdapterInfos = await this.investor.userAdapterInfos(
        this.tomAddr,
        1,
        this.aAdapter.address
      );
      expect(BigNumber.from(tomAdapterInfos.amount).gt(0)).to.eq(true);

      const afterAdapterInfos = await this.investor.adapterInfos(
        1,
        this.aAdapter.address
      );
      expect(
        BigNumber.from(afterAdapterInfos.totalStaked).gt(
          beforeAdapterInfos.totalStaked
        )
      ).to.eq(true);
      expect(
        BigNumber.from(afterAdapterInfos.totalStaked).sub(
          tomAdapterInfos.amount
        )
      ).to.eq(BigNumber.from(beforeAdapterInfos.totalStaked));

      const tomWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.tomAddr,
        1
      );
      expect(BigNumber.from(tomWithdrable)).to.eq(
        BigNumber.from(tomAdapterInfos.amount)
      );
    });
  });

  describe("withdrawBNB() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(
        this.investor.withdrawBNB(this.owner.address, 3, { gasPrice: 21e9 })
      ).to.be.revertedWith("Error: nft tokenId is invalid");
    });

    it("(2)should be reverted when caller is not matched", async function () {
      // deposit to nftID: 1
      await expect(
        this.investor.withdrawBNB(this.alice.address, 1, { gasPrice: 21e9 })
      ).to.be.revertedWith("Error: Caller is not matched");
    });

    it("(3)should receive the BNB successfully after withdraw function for alice", async function () {
      // withdraw from nftId: 1
      const beforeBNB = await ethers.provider.getBalance(this.aliceAddr);

      await expect(
        this.investor
          .connect(this.alice)
          .withdrawBNB(this.aliceAddr, 1, { gasPrice: 21e9 })
      ).to.emit(this.investor, "WithdrawBNB");

      const afterBNB = await ethers.provider.getBalance(this.aliceAddr);
      expect(BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))).to.eq(
        true
      );

      const aliceInfo = await this.investor.userInfo(
        this.aliceAddr,
        this.ybNft.address,
        1
      );
      expect(aliceInfo).to.eq(BigNumber.from(0));

      const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.aliceAddr,
        1
      );
      expect(BigNumber.from(aliceWithdrable)).to.eq(BigNumber.from(0));

      const bobInfo = await this.investor.userInfo(
        this.bobAddr,
        this.ybNft.address,
        1
      );
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(20);

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.bobAddr,
        1
      );
      expect(BigNumber.from(bobWithdrable).gt(0)).to.eq(true);
    });

    it("(4)should receive the BNB successfully after withdraw function for bob", async function () {
      // withdraw from nftId: 1
      const beforeBNB = await ethers.provider.getBalance(this.bobAddr);

      await expect(
        this.investor
          .connect(this.bob)
          .withdrawBNB(this.bobAddr, 1, { gasPrice: 21e9 })
      ).to.emit(this.investor, "WithdrawBNB");

      const afterBNB = await ethers.provider.getBalance(this.bobAddr);

      expect(BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))).to.eq(
        true
      );

      const bobInfo = await this.investor.userInfo(
        this.bobAddr,
        this.ybNft.address,
        1
      );
      expect(bobInfo).to.eq(BigNumber.from(0));

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.bobAddr,
        1
      );
      expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(0));

      const tomInfo = await this.investor.userInfo(
        this.tomAddr,
        this.ybNft.address,
        1
      );
      const tomDeposit = Number(tomInfo) / Math.pow(10, 18);
      expect(tomDeposit).to.eq(30);

      const tomWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.tomAddr,
        1
      );
      expect(BigNumber.from(tomWithdrable).gt(0)).to.eq(true);
    });

    it("(5)should receive the BNB successfully after withdraw function for tom", async function () {
      // withdraw from nftId: 1
      const beforeBNB = await ethers.provider.getBalance(this.tomAddr);

      await expect(
        this.investor
          .connect(this.tom)
          .withdrawBNB(this.tomAddr, 1, { gasPrice: 21e9 })
      ).to.emit(this.investor, "WithdrawBNB");

      const afterBNB = await ethers.provider.getBalance(this.tomAddr);

      expect(BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))).to.eq(
        true
      );

      const tomInfo = await this.investor.userInfo(
        this.tomAddr,
        this.ybNft.address,
        1
      );
      expect(tomInfo).to.eq(BigNumber.from(0));

      const tomWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.tomAddr,
        1
      );
      expect(tomWithdrable).to.eq(0);
    });
  });
});
