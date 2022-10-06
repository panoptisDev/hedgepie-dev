const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const forkNetwork = async () => {
  await hre.network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: "https://polygon-rpc.com",
        },
      },
    ],
  });
};

describe("ApeswapLPDualFarmAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    await forkNetwork();

    const [owner, alice, bob] = await ethers.getSigners();

    const performanceFee = 50;
    const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const AXNToken = "0x839F1a22A59eAAf26c85958712aB32F80FEA23d9";
    const strategy = "0x54aff400858Dcac39797a81894D9920f16972D1D"; // MiniApeV2
    const stakingToken = "0x81A3F6a138F0B12eCBDCE4583972A6CA57514dBd"; // USDC-AXN Apeswap LP
    const rewardToken = "0x5d47bAbA0d66083C52009271faF3F50DCc01023C"; // BANANA token
    const swapRouter = "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607"; // apeswap router v2 address

    this.owner = owner;
    this.alice = alice;
    this.bob = bob;

    this.bobAddr = bob.address;
    this.aliceAddr = alice.address;

    this.accTokenPerShare = BigNumber.from(0);
    this.accTokenPerShare1 = BigNumber.from(0);

    // Deploy Apeswap LPFarm Adapter contract
    const ApeswapAdapter = await ethers.getContractFactory("ApeswapFarmAdapter");
    this.aAdapter = await ApeswapAdapter.deploy(
      16, // pid
      strategy,
      stakingToken,
      rewardToken,
      AXNToken,
      swapRouter,
      "Apeswap::USDC-AXN LP::Farm"
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
        HedgepieLibraryMatic: lib.address,
      },
    });
    this.investor = await investorFactory.deploy(this.ybNft.address, swapRouter, wmatic);
    await this.investor.deployed();

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory("HedgepieAdapterManagerMatic");
    this.adapterManager = await adapterManager.deploy();

    // set investor in adapter
    await this.aAdapter.setInvestor(this.investor.address);

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint([10000], [stakingToken], [this.aAdapter.address], performanceFee, "test tokenURI1");

    // tokenID: 2
    await this.ybNft.mint([10000], [stakingToken], [this.aAdapter.address], performanceFee, "test tokenURI2");

    // Add ApeswapLPDualFarm Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.aAdapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);
    await this.investor.setTreasury(this.owner.address);
    
    await this.aAdapter.setPath(wmatic, USDC, [wmatic, USDC]);
    await this.aAdapter.setPath(USDC, wmatic, [USDC, wmatic]);
    await this.aAdapter.setPath(wmatic, AXNToken, [wmatic, AXNToken]);
    await this.aAdapter.setPath(AXNToken, wmatic, [AXNToken, wmatic]);

    await this.aAdapter.setPath(wmatic, rewardToken, [wmatic, rewardToken]);
    await this.aAdapter.setPath(rewardToken, wmatic, [rewardToken, wmatic]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", strategy);
    console.log("ApeswapLPDualFarmAdapter: ", this.aAdapter.address);
  });

  describe("depositMATIC function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // deposit to nftID: 3
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor.connect(this.owner).depositMATIC(this.owner.address, 3, depositAmount.toString(), {
          value: depositAmount,
        })
      ).to.be.revertedWith("nft tokenId is invalid");
    });

    it("(2)should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.depositMATIC(this.owner.address, 1, depositAmount.toString(), {
          value: depositAmount,
        })
      ).to.be.revertedWith("Amount can not be 0");
    });

    it("(3)deposit should success for Alice", async function () {
      const depositAmount = ethers.utils.parseEther("100");
      await expect(
        this.investor.connect(this.alice).depositMATIC(this.aliceAddr, 1, depositAmount, {
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositMATIC")
        .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

      const aliceInfo = await this.investor.userInfo(this.aliceAddr, this.ybNft.address, 1);
      const aliceDeposit = Number(aliceInfo) / Math.pow(10, 18);
      expect(aliceDeposit).to.eq(100);

      const aliceAdapterInfos = await this.investor.userAdapterInfos(this.aliceAddr, 1, this.aAdapter.address);
      expect(BigNumber.from(aliceAdapterInfos.amount).gt(0)).to.eq(true);

      const adapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
      expect(BigNumber.from(adapterInfos.totalStaked).sub(BigNumber.from(aliceAdapterInfos.amount))).to.eq(0);

      const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(this.aliceAddr, 1);
      expect(BigNumber.from(aliceWithdrable)).to.be.within(
        BigNumber.from(aliceAdapterInfos.amount),
        BigNumber.from(aliceAdapterInfos.amount).add(1)
      );

      // Check accTokenPerShare Info
      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
      expect(BigNumber.from(this.accTokenPerShare)).to.eq(BigNumber.from(0));
    });

    it("(4)deposit should success for Bob", async function () {
      // wait 40 mins
      for (let i = 0; i < 7200; i++) {
        await ethers.provider.send("evm_mine", []);
      }

      const beforeAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);

      const depositAmount = ethers.utils.parseEther("200");
      await expect(
        this.investor.connect(this.bob).depositMATIC(this.bobAddr, 1, depositAmount, {
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositMATIC")
        .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

      const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
      expect(Number(bobInfo) / Math.pow(10, 18)).to.eq(200);

      const bobAdapterInfos = await this.investor.userAdapterInfos(this.bobAddr, 1, this.aAdapter.address);
      expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

      const afterAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
      expect(BigNumber.from(afterAdapterInfos.totalStaked).gt(beforeAdapterInfos.totalStaked)).to.eq(true);

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
      expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(bobAdapterInfos.amount));

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare).eq(
          BigNumber.from(this.accTokenPerShare)
        )
      ).to.eq(true);
      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
      this.accTokenPerShare1 = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare1;
    }).timeout(50000000);

    it("(5) test claim, pendingReward function and protocol-fee", async function () {
      const beforeMatic = await ethers.provider.getBalance(this.aliceAddr);
      const beforeMaticOwner = await ethers.provider.getBalance(this.owner.address);
      const pending = await this.investor.pendingReward(this.aliceAddr, 1);

      await this.investor.connect(this.alice).claim(1);
      const gasPrice = await ethers.provider.getGasPrice();
      const gas = await this.investor.connect(this.alice).estimateGas.claim(1);

      const afterMatic = await ethers.provider.getBalance(this.aliceAddr);
      const protocolFee = (await ethers.provider.getBalance(this.owner.address)).sub(beforeMaticOwner);
      const actualPending = afterMatic.sub(beforeMatic).add(gas.mul(gasPrice));

      if (pending > 0) {
        expect(pending).to.be.within(actualPending, actualPending.add(BigNumber.from(2e14))) &&
          expect(protocolFee).to.be.within(
            actualPending.mul(this.performanceFee).div(1e4),
            actualPending.add(BigNumber.from(2e14)).mul(this.performanceFee).div(1e4)
          );
      }
    });

    it("(6) test TVL & participants", async function () {
      const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(300) &&
        expect(BigNumber.from(nftInfo.totalParticipant).toString()).to.be.eq("2");
    });
  });

  describe("withdrawMATIC() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(this.investor.withdrawMATIC(this.owner.address, 3)).to.be.revertedWith("nft tokenId is invalid");
    });

    it("(2)should receive MATIC successfully after withdraw function for Alice", async function () {
      // withdraw from nftId: 1
      const beforeMATIC = await ethers.provider.getBalance(this.aliceAddr);

      await expect(this.investor.connect(this.alice).withdrawMATIC(this.aliceAddr, 1)).to.emit(
        this.investor,
        "WithdrawMATIC"
      );

      const afterMATIC = await ethers.provider.getBalance(this.aliceAddr);

      expect(BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))).to.eq(true);

      const aliceInfo = await this.investor.userInfo(this.aliceAddr, this.ybNft.address, 1);
      expect(aliceInfo).to.eq(BigNumber.from(0));

      const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(this.aliceAddr, 1);
      expect(BigNumber.from(aliceWithdrable)).to.eq(BigNumber.from(0));

      const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(200);

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
      expect(BigNumber.from(bobWithdrable).gt(0)).to.eq(true);

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare).eq(
          BigNumber.from(this.accTokenPerShare)
        )
      ).to.eq(true) &&
        expect(
          BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare1).gt(
            BigNumber.from(this.accTokenPerShare1)
          )
        ).to.eq(true);

      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
      this.accTokenPerShare1 = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare1;
    }).timeout(50000000);

    it("(3) test TVL & participants after Alice withdraw", async function () {
      const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(200) &&
        expect(BigNumber.from(nftInfo.totalParticipant).toString()).to.be.eq("1");
    });

    it("(4)should receive MATIC successfully after withdraw function for Bob", async function () {
      // withdraw from nftId: 1
      const beforeMATIC = await ethers.provider.getBalance(this.bobAddr);

      await expect(this.investor.connect(this.bob).withdrawMATIC(this.bobAddr, 1)).to.emit(
        this.investor,
        "WithdrawMATIC"
      );

      const afterMATIC = await ethers.provider.getBalance(this.bobAddr);

      expect(BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))).to.eq(true);

      const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
      expect(bobInfo).to.eq(BigNumber.from(0));

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
      expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(0));

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare).eq(
          BigNumber.from(this.accTokenPerShare)
        )
      ).to.eq(true) &&
        expect(
          BigNumber.from((await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare1).gt(
            BigNumber.from(this.accTokenPerShare1)
          )
        ).to.eq(true);
      this.accTokenPerShare = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare;
      this.accTokenPerShare1 = (await this.investor.adapterInfos(1, this.aAdapter.address)).accTokenPerShare1;
    }).timeout(50000000);

    it("(5) test TVL & participants after Alice & Bob withdraw", async function () {
      const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(0) &&
        expect(BigNumber.from(nftInfo.totalParticipant).toString()).to.be.eq("0");
    });
  });
});
