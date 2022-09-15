const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const forkNetwork = async () => {
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: 'https://polygon-rpc.com',
        },
      },
    ],
  })
}

describe("QuickLPFarmAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    await forkNetwork();

    const [owner, alice, bob, tom] = await ethers.getSigners();

    const performanceFee = 50;
    const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    const strategy = "0x1098d71eCD0233929DA8a10579E96cBbbe78f7C2"; // USDC-ASTRAFER LP Farm
    const stakingToken = "0x01eBD3e57f4af47B7E96240e2B7B2227C902614A"; // USDC-ASTRAFER LP
    const rewardToken = "0x831753DD7087CaC61aB5644b308642cc1c33Dc13"; // Quick token
    const swapRouter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; // quickswap rounter address

    this.owner = owner;
    this.alice = alice;
    this.bob = bob;
    this.tom = tom;

    this.bobAddr = bob.address;
    this.aliceAddr = alice.address;
    this.tomAddr = tom.address;

    // Deploy Quick LPFarm Adapter contract
    const QuickAdapter = await ethers.getContractFactory("QuickLPFarmAdapter");
    this.aAdapter = await QuickAdapter.deploy(
      strategy,
      stakingToken,
      rewardToken,
      swapRouter,
      "Quickswap::USDC-ASTRAFER::LP-Farm"
    );
    await this.aAdapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    const Lib = await ethers.getContractFactory("HedgepieLibraryMatic");
    const lib = await Lib.deploy();

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory("HedgepieInvestorMatic", {
      libraries: {
        HedgepieLibrary: lib.address,
      }
    });
    this.investor = await investorFactory.deploy(this.ybNft.address, swapRouter, wmatic);
    await this.investor.deployed();

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory("HedgepieAdapterManager");
    this.adapterManager = await adapterManager.deploy();
    
    // set investor
    await this.aAdapter.setInvestor(this.investor.address);

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint([10000], [stakingToken], [this.aAdapter.address], performanceFee, "test tokenURI1");

    // tokenID: 2
    await this.ybNft.mint([10000], [stakingToken], [this.aAdapter.address], performanceFee, "test tokenURI2");

    // Add Venus Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.aAdapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);
    await this.investor.setTreasury(this.owner.address);

    // Set investor in vAdapter
    await this.aAdapter.setInvestor(this.investor.address);
    
    const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const ASTRAFER = "0xDfCe1e99A31C4597a3f8A8945cBfa9037655e335";
    await this.aAdapter.setPath(wmatic, USDC, [wmatic, USDC]);
    await this.aAdapter.setPath(USDC, wmatic, [USDC, wmatic]);
    await this.aAdapter.setPath(wmatic, ASTRAFER, [wmatic, ASTRAFER]);
    await this.aAdapter.setPath(ASTRAFER, wmatic, [ASTRAFER, wmatic]);

    await this.aAdapter.setPath(wmatic, rewardToken, [wmatic, rewardToken]);
    await this.aAdapter.setPath(rewardToken, wmatic, [rewardToken, wmatic]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", strategy);
    console.log("QuickLPFarmAdapter: ", this.aAdapter.address);
  });

  describe("depositMATIC function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // deposit to nftID: 3
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor
          .connect(this.owner)
          .depositMATIC(this.owner.address, 3, depositAmount.toString(), {
            value: depositAmount,
          })
      ).to.be.revertedWith("Error: nft tokenId is invalid");
    });

    it("(2)should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.depositMATIC(
          this.owner.address,
          1,
          depositAmount.toString(),
          {
            value: depositAmount,
          }
        )
      ).to.be.revertedWith("Error: Amount can not be 0");
    });

    it("(3)deposit should success for Alice", async function () {
      const depositAmount = ethers.utils.parseEther("100");
      await expect(
        this.investor
          .connect(this.alice)
          .depositMATIC(this.aliceAddr, 1, depositAmount, {
            value: depositAmount,
          })
      )
        .to.emit(this.investor, "DepositMATIC")
        .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

      const aliceInfo = await this.investor.userInfo(
        this.aliceAddr,
        this.ybNft.address,
        1
      );
      const aliceDeposit = Number(aliceInfo) / Math.pow(10, 18);
      expect(aliceDeposit).to.eq(100);

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

    it("(4)deposit should success for Bob", async function () {
      const aliceAdapterInfos = await this.investor.userAdapterInfos(
        this.aliceAddr,
        1,
        this.aAdapter.address
      );
      const beforeAdapterInfos = await this.investor.adapterInfos(
        1,
        this.aAdapter.address
      );

      const depositAmount = ethers.utils.parseEther("200");
      await expect(
        this.investor
          .connect(this.bob)
          .depositMATIC(this.bobAddr, 1, depositAmount, {
            value: depositAmount,
          })
      )
        .to.emit(this.investor, "DepositMATIC")
        .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

      const bobInfo = await this.investor.userInfo(
        this.bobAddr,
        this.ybNft.address,
        1
      );
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(200);

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
    }).timeout(50000000);

    it("(5)deposit should success for Tom", async function () {
      const beforeAdapterInfos = await this.investor.adapterInfos(
        1,
        this.aAdapter.address
      );

      const depositAmount = ethers.utils.parseEther("30");
      await expect(
        this.investor
          .connect(this.tom)
          .depositMATIC(this.tomAddr, 1, depositAmount, {
            value: depositAmount,
          })
      )
        .to.emit(this.investor, "DepositMATIC")
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
    }).timeout(50000000);
  });

  describe("withdrawMATIC() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(
        this.investor.withdrawMATIC(this.owner.address, 3)
      ).to.be.revertedWith("Error: nft tokenId is invalid");
    });

    it("(2)should receive MATIC successfully after withdraw function for Alice", async function () {
      // withdraw from nftId: 1
      const beforeMATIC = await ethers.provider.getBalance(this.aliceAddr);

      await expect(
        this.investor
          .connect(this.alice)
          .withdrawMATIC(this.aliceAddr, 1)
      ).to.emit(this.investor, "WithdrawMATIC");

      const afterMATIC = await ethers.provider.getBalance(this.aliceAddr);

      expect(BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))).to.eq(
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
      expect(bobDeposit).to.eq(200);

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.bobAddr,
        1
      );
      expect(BigNumber.from(bobWithdrable).gt(0)).to.eq(true);
    }).timeout(50000000);

    it("(3)should receive MATIC successfully after withdraw function for Bob", async function () {
      // withdraw from nftId: 1
      const beforeMATIC = await ethers.provider.getBalance(this.bobAddr);

      await expect(
        this.investor
          .connect(this.bob)
          .withdrawMATIC(this.bobAddr, 1)
      ).to.emit(this.investor, "WithdrawMATIC");

      const afterMATIC = await ethers.provider.getBalance(this.bobAddr);

      expect(BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))).to.eq(
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
    }).timeout(50000000);

    it("(4)should receive MATIC successfully after withdraw function for Tom", async function () {
      // withdraw from nftId: 1
      const beforeMATIC = await ethers.provider.getBalance(this.tomAddr);

      await expect(
        this.investor
          .connect(this.tom)
          .withdrawMATIC(this.tomAddr, 1)
      ).to.emit(this.investor, "WithdrawMATIC");

      const afterMATIC = await ethers.provider.getBalance(this.tomAddr);

      expect(BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))).to.eq(
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
    }).timeout(50000000);
  });
});
