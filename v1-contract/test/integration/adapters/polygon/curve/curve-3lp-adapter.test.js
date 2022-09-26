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

describe("CurveGaugeAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    await forkNetwork();

    const [owner, alice, bob] = await ethers.getSigners();

    const performanceFee = 50;
    const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    const strategy = "0x19793B454D3AfC7b454F206Ffe95aDE26cA6912c"; // a3Crv Gauge
    const stakingToken = "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171"; // Curve.fi amDAI/amUSDC/amUSDT (am3CRV)
    const liquidityToken = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" // USDC
    const poolContract = "0x445FE580eF8d70FF569aB36e80c647af338db351"; // swap address
    const swapRouter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; // quickswap rounter address
    const rewardToken = "0x172370d5Cd63279eFa6d502DAB29171933a610AF" // CRV token
    const rewardToken1 = wmatic;

    this.performanceFee = performanceFee;
    this.owner = owner;
    this.alice = alice;
    this.bob = bob;

    this.bobAddr = bob.address;
    this.aliceAddr = alice.address;
    
    this.accTokenPerShare = BigNumber.from(0);

    // Deploy CurveGauge Adapter contract
    const curveAdapter = await ethers.getContractFactory("Curve3LPAdaper");
    this.aAdapter = await curveAdapter.deploy(
      strategy,
      stakingToken,
      rewardToken,
      rewardToken1,
      liquidityToken,
      poolContract,
      1,
      true,
      "Curve::a3Crv::Gauge"
    );
    await this.aAdapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    const Lib = await ethers.getContractFactory("HedgepieLibraryMatic");
    const lib = await Lib.deploy();
    this.lib = lib;

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory("HedgepieInvestorMatic", {
      libraries: {
        HedgepieLibraryMatic: lib.address,
      }
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

    // Add Curve3LP Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.aAdapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);
    await this.investor.setTreasury(this.owner.address);

    await this.aAdapter.setPath(wmatic, liquidityToken, [wmatic, liquidityToken]);
    await this.aAdapter.setPath(liquidityToken, wmatic, [liquidityToken, wmatic]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", strategy);
    console.log("CurveGaugeAdapter: ", this.aAdapter.address);
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
      expect(
        BigNumber.from(aliceWithdrable)
      ).to.be.within(
        BigNumber.from(aliceAdapterInfos.amount),
        BigNumber.from(aliceAdapterInfos.amount).add(1)
      );

      // Check accTokenPerShare Info
      this.accTokenPerShare = (
        await this.investor.adapterInfos(1, this.aAdapter.address)
      ).accTokenPerShare;
      expect(BigNumber.from(this.accTokenPerShare)).to.eq(BigNumber.from(0));
    });

    it("(4)deposit should success for Bob", async function () {
      // wait 40 mins
      for (let i = 0; i < 7200; i++) {
        await ethers.provider.send("evm_mine", []);
      }

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
      expect(Number(bobInfo) / Math.pow(10, 18)).to.eq(200);

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

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(
        this.bobAddr,
        1
      );
      expect(BigNumber.from(bobWithdrable)).to.eq(
        BigNumber.from(bobAdapterInfos.amount)
      );

      // Check accTokenPerShare Info
      expect(
        BigNumber.from(
          (await this.investor.adapterInfos(1, this.aAdapter.address))
            .accTokenPerShare
        ).eq(BigNumber.from(this.accTokenPerShare))
      ).to.eq(true);
      this.accTokenPerShare = (
        await this.investor.adapterInfos(1, this.aAdapter.address)
      ).accTokenPerShare;
    }).timeout(50000000);

    it("(5) test claim, pendingReward function and protocol-fee", async function () {
      const beforeBNB = await ethers.provider.getBalance(this.aliceAddr);
      const beforeBNBOwner = await ethers.provider.getBalance(
        this.owner.address
      );
      const pending = await this.investor.pendingReward(this.aliceAddr, 1);

      await this.investor.connect(this.alice).claim(1);
      const gasPrice = await ethers.provider.getGasPrice();
      const gas = await this.investor.connect(this.alice).estimateGas.claim(1);

      const afterBNB = await ethers.provider.getBalance(this.aliceAddr);
      const protocolFee = (
        await ethers.provider.getBalance(this.owner.address)
      ).sub(beforeBNBOwner);
      const actualPending = afterBNB.sub(beforeBNB).add(gas.mul(gasPrice));
      
      if(pending > 0) {
        expect(pending).to.be.within(
          actualPending,
          actualPending.add(BigNumber.from(2e14))
        ) &&
          expect(protocolFee).to.be.within(
            actualPending.mul(this.performanceFee).div(1e4),
            actualPending
              .add(BigNumber.from(2e14))
              .mul(this.performanceFee)
              .div(1e4)
          );
      }
    });

    it("(6) test TVL & participants", async function () {
      const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

      expect(
        Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))
      ).to.be.eq(300) &&
        expect(BigNumber.from(nftInfo.totalParticipant).toString()).to.be.eq(
          "2"
        );
    });
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

      // Check accTokenPerShare Info
      expect(
        BigNumber.from(
          (await this.investor.adapterInfos(1, this.aAdapter.address))
            .accTokenPerShare
        ).eq(BigNumber.from(this.accTokenPerShare))
      ).to.eq(true);

      this.accTokenPerShare = (
        await this.investor.adapterInfos(1, this.aAdapter.address)
      ).accTokenPerShare;
    }).timeout(50000000);

    it("(3) test TVL & participants after Alice withdraw", async function () {
      const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

      expect(
        Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))
      ).to.be.eq(200) &&
        expect(BigNumber.from(nftInfo.totalParticipant).toString()).to.be.eq(
          "1"
        );
    });

    it("(4)should receive MATIC successfully after withdraw function for Bob", async function () {
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

      // Check accTokenPerShare Info
      expect(
        BigNumber.from(
          (await this.investor.adapterInfos(1, this.aAdapter.address))
            .accTokenPerShare
        ).eq(BigNumber.from(this.accTokenPerShare))
      ).to.eq(true);
      this.accTokenPerShare = (
        await this.investor.adapterInfos(1, this.aAdapter.address)
      ).accTokenPerShare;
    }).timeout(50000000);

    it("(5) test TVL & participants after Alice & Bob withdraw", async function () {
      const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

      expect(
        Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))
      ).to.be.eq(0) &&
        expect(BigNumber.from(nftInfo.totalParticipant).toString()).to.be.eq(
          "0"
        );
    });
  });
});
