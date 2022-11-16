const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

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

describe("YearnCurveAdapterEth Integration Test", function () {
  before("Deploy contract", async function () {
    await forkNetwork();

    const [owner, alice, bob, treasury] = await ethers.getSigners();

    const performanceFee = 100;
    const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const stakingToken = "0x3A283D9c08E8b55966afb64C515f5143cf907611"; // Curve CVX-ETH (crvCVXETH)
    const strategy = "0x1635b506a88fBF428465Ad65d00e8d6B6E5846C3"; // Curve CVX-ETH Pool yVault
    const swapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 router address
    const poolContract = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4" // Curve CVX-ETH Pool

    this.performanceFee = performanceFee;
    this.weth = weth;

    this.owner = owner;
    this.alice = alice;
    this.bob = bob;

    this.bobAddr = bob.address;
    this.aliceAddr = alice.address;
    this.treasuryAddr = treasury.address;

    // Deploy Pancakeswap LP Adapter contract
    const Lib = await ethers.getContractFactory("HedgepieLibraryEth");
    const lib = await Lib.deploy();
    const YearnCurveAdapter = await ethers.getContractFactory("YearnCurveAdapter", {
      libraries: {
        HedgepieLibraryEth: lib.address,
      },
    });

    this.aAdapter = await YearnCurveAdapter.deploy(
      strategy,
      stakingToken,
      poolContract,
      swapRouter,
      weth,
      weth, // liquiditytoken
      2,
      0,
      true,
      "Yearn::Curve CVX-ETH::Vault"
    );
    await this.aAdapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    // Deploy Adaptor Info contract
    const adapterInfo = await ethers.getContractFactory("HedgepieAdapterInfoEth");
    this.adapterInfo = await adapterInfo.deploy();
    await this.adapterInfo.setManager(this.aAdapter.address, true);

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory("HedgepieInvestorEth");
    this.investor = await investorFactory.deploy(this.ybNft.address, this.treasuryAddr, this.adapterInfo.address);

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory("HedgepieAdapterManagerEth");
    this.adapterManager = await adapterManager.deploy();

    // set investor
    await this.aAdapter.setInvestor(this.investor.address);

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint([10000], [stakingToken], [this.aAdapter.address], performanceFee, "test tokenURI1");

    // tokenID: 2
    await this.ybNft.mint([10000], [stakingToken], [this.aAdapter.address], performanceFee, "test tokenURI2");

    // Add YearnCurveVault Adapter to AdapterManager
    await this.adapterManager.addAdapter(this.aAdapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);
    await this.investor.setTreasury(this.owner.address);

    // Set investor in yearn curve vault adapter
    await this.aAdapter.setInvestor(this.investor.address);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", strategy);
    console.log("Info: ", this.adapterInfo.address);
    console.log("YearnCurveVaultAdapter: ", this.aAdapter.address);

    this.repayToken = await ethers.getContractAt("IBEP20", strategy);
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
      await expect(
        this.investor.depositETH(1, depositAmount.toString(), { gasPrice: 21e9 }))
        .to.be.revertedWith(
            "Error: Insufficient ETH"
        );
    });

    it("(3)deposit should success for Alice", async function () {
        const beforeRepay = await this.repayToken.balanceOf(this.aAdapter.address);
        const depositAmount = ethers.utils.parseEther("10");
        await expect(
          this.investor.connect(this.alice).depositETH(1, depositAmount, {
            value: depositAmount,
          })
        )
          .to.emit(this.investor, "DepositETH")
          .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);
  
        const aliceAdapterInfos = await this.aAdapter.userAdapterInfos(this.aliceAddr, 1);
        expect(BigNumber.from(aliceAdapterInfos.amount).gt(0)).to.eq(true);
  
        const adapterInfos = await this.aAdapter.adapterInfos(1);
        expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(BigNumber.from(aliceAdapterInfos.amount));
  
        const afterRepay = await this.repayToken.balanceOf(this.aAdapter.address);
        expect(BigNumber.from(aliceAdapterInfos.userShares)).to.eq(BigNumber.from(afterRepay).sub(BigNumber.from(beforeRepay)));
    });
  
    it("(4)deposit should success for Bob", async function () {
        const beforeRepay = await this.repayToken.balanceOf(this.aAdapter.address);
        const aliceAdapterInfos = await this.aAdapter.userAdapterInfos(this.aliceAddr, 1);
        const beforeAdapterInfos = await this.aAdapter.adapterInfos(1);
  
        const depositAmount = ethers.utils.parseEther("10");
        await expect(
          this.investor.connect(this.bob).depositETH(1, depositAmount, {
            value: depositAmount,
          })
        )
          .to.emit(this.investor, "DepositETH")
          .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

        await expect(
            this.investor.connect(this.bob).depositETH(1, depositAmount, {
              value: depositAmount,
            })
        )
            .to.emit(this.investor, "DepositETH")
            .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);
  
        const bobAdapterInfos = await this.aAdapter.userAdapterInfos(this.bobAddr, 1);
        expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);
  
        const afterAdapterInfos = await this.aAdapter.adapterInfos(1);
        expect(BigNumber.from(afterAdapterInfos.totalStaked).gt(beforeAdapterInfos.totalStaked)).to.eq(true);
        expect(BigNumber.from(afterAdapterInfos.totalStaked).sub(aliceAdapterInfos.amount)).to.eq(
          BigNumber.from(bobAdapterInfos.amount)
        );

        const afterRepay = await this.repayToken.balanceOf(this.aAdapter.address);
        expect(BigNumber.from(bobAdapterInfos.userShares)).to.eq(BigNumber.from(afterRepay).sub(BigNumber.from(beforeRepay)));
    }).timeout(50000000);
    
    it("(5) test TVL & participants", async function () {
      const nftInfo = await this.adapterInfo.adapterInfo(1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(30) &&
        expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq("2");

      const pendingInfo = await this.aAdapter.pendingReward(1, this.alice.address);
      expect(pendingInfo).to.gte(0);
    });
  });

  describe("withdrawETH() function test", function () {
    it("(1) revert when nft tokenId is invalid", async function () {
      for (let i = 0; i < 10; i++) {
        await ethers.provider.send("evm_mine", []);
      }
      await ethers.provider.send("evm_increaseTime", [3600 * 24]);
      await ethers.provider.send("evm_mine", []);

      // withdraw to nftID: 3
      await expect(this.investor.connect(this.owner).withdrawETH(3, { gasPrice: 21e9 })).to.be.revertedWith(
        "Error: nft tokenId is invalid"
      );
    });

    it("(2) should receive the ETH successfully after withdraw function for Alice", async function () {
      await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
      await ethers.provider.send("evm_mine", []);

      // withdraw from nftId: 1
      const beforeETH = await ethers.provider.getBalance(this.aliceAddr);
      const beforeOwnerETH = await ethers.provider.getBalance(this.owner.address);
      let aliceInfo = (await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)).invested;

      const gasPrice = 21e9;
      const gas = await this.investor.connect(this.alice).estimateGas.withdrawETH(1, { gasPrice });
      await expect(this.investor.connect(this.alice).withdrawETH(1, { gasPrice })).to.emit(
        this.investor,
        "WithdrawETH"
      );

      const afterETH = await ethers.provider.getBalance(this.aliceAddr);
      expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

      // check protocol fee
      const rewardAmt = afterETH.sub(beforeETH);
      const afterOwnerETH = await ethers.provider.getBalance(this.owner.address);
      let actualPending = rewardAmt.add(gas.mul(gasPrice));
      if(actualPending.gt(aliceInfo)) {
        actualPending = actualPending.sub(BigNumber.from(aliceInfo));
        const protocolFee = afterOwnerETH.sub(beforeOwnerETH);
        expect(protocolFee).to.gt(0);
        expect(actualPending).to.be.within(
          protocolFee.mul(1e4 - this.performanceFee).div(this.performanceFee).sub(gas.mul(gasPrice)),
          protocolFee.mul(1e4 - this.performanceFee).div(this.performanceFee).add(gas.mul(gasPrice))
        );
      }

      aliceInfo = (await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)).invested;
      expect(aliceInfo).to.eq(BigNumber.from(0));

      const bobInfo = (await this.aAdapter.userAdapterInfos(this.bobAddr, 1)).invested;
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(20);
    });

    it("(3) test TVL & participants after Alice withdraw", async function () {
        const nftInfo = await this.adapterInfo.adapterInfo(1);
  
        expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(20) &&
          expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq("1");
    });

    it("(4) should receive the ETH successfully after withdraw function for Bob", async function () {
      await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
      await ethers.provider.send("evm_mine", []);
      // withdraw from nftId: 1
      const beforeETH = await ethers.provider.getBalance(this.bobAddr);
      const beforeOwnerETH = await ethers.provider.getBalance(this.owner.address);
      let bobInfo = (await this.aAdapter.userAdapterInfos(this.bobAddr, 1)).invested;

      const gasPrice = 21e9;      
      const gas = await this.investor.connect(this.bob).estimateGas.withdrawETH(1, { gasPrice });
      await expect(this.investor.connect(this.bob).withdrawETH(1, { gasPrice })).to.emit(
        this.investor,
        "WithdrawETH"
      );

      const afterETH = await ethers.provider.getBalance(this.bobAddr);
      expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

      // check protocol fee
      const rewardAmt = afterETH.sub(beforeETH);
      let actualPending = rewardAmt.add(gas.mul(gasPrice));
      if(actualPending.gt(bobInfo)) {
        actualPending = actualPending - bobInfo;
        const afterOwnerETH = await ethers.provider.getBalance(this.owner.address);
        const protocolFee = afterOwnerETH.sub(beforeOwnerETH);
        expect(protocolFee).to.gt(0);
        expect(actualPending).to.be.within(
          protocolFee.mul(1e4 - this.performanceFee).div(this.performanceFee).sub(gas.mul(gasPrice)),
          protocolFee.mul(1e4 - this.performanceFee).div(this.performanceFee).add(gas.mul(gasPrice))
        );
      }

      bobInfo = (await this.aAdapter.userAdapterInfos(this.bobAddr, 1)).invested;
      expect(bobInfo).to.eq(BigNumber.from(0));
    });

    it("(5) test TVL & participants after Alice & Bob withdraw", async function () {
        const nftInfo = await this.adapterInfo.adapterInfo(1);
  
        expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(0) &&
          expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq("0");
    });
  });
});
