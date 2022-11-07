const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const unlockAccount = async (address) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return hre.ethers.provider.getSigner(address);
};

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

describe("PickleSushiGaugeAdapterEth Integration Test", function () {
  before("Deploy contract", async function () {
    await forkNetwork();

    const [owner, alice, bob, treasury] = await ethers.getSigners();

    const performanceFee = 100;
    const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const pickle = "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5";
    const wbtc = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"; // WBTC
    const strategy = "0xD55331E7bCE14709d825557E5Bca75C73ad89bFb"; // pSushi WBTC/ETH Gauge
    const swapRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"; // sushi router address
    const lpToken = "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58"; // WBTC-WETH LP
    const jar = "0xde74b6c547bd574c3527316a2eE30cd8F6041525" // pickling SushiSwap WBTC-ETH(pSLP)

    this.performanceFee = performanceFee;

    this.owner = owner;
    this.alice = alice;
    this.bob = bob;

    this.bobAddr = bob.address;
    this.aliceAddr = alice.address;
    this.treasuryAddr = treasury.address;
    this.accTokenPerShare = BigNumber.from(0);
    this.accTokenPerShare1 = BigNumber.from(0);

    // Deploy PickleSushiAdapter contract
    const Lib = await ethers.getContractFactory("HedgepieLibraryEth");
    const lib = await Lib.deploy();
    const PickleSushiAdapter = await ethers.getContractFactory("PickleSushiGaugeAdapter", {
      libraries: {
        HedgepieLibraryEth: lib.address,
      },
    });

    this.aAdapter = await PickleSushiAdapter.deploy(
      strategy,
      jar,
      lpToken,
      pickle,
      ethers.constants.AddressZero,
      swapRouter,
      weth,
      "Pickle::Sushi::WBTC-ETH"
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
    await this.ybNft.mint([10000], [lpToken], [this.aAdapter.address], performanceFee, "test tokenURI1");

    // tokenID: 2
    await this.ybNft.mint([10000], [lpToken], [this.aAdapter.address], performanceFee, "test tokenURI2");

    // Add PickleSushiAdapter to AdapterManager
    await this.adapterManager.addAdapter(this.aAdapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);
    await this.investor.setTreasury(this.owner.address);

    await this.aAdapter.setPath(weth, pickle, [weth, pickle]);
    await this.aAdapter.setPath(pickle, weth, [pickle, weth]);
    await this.aAdapter.setPath(weth, wbtc, [weth, wbtc]);
    await this.aAdapter.setPath(wbtc, weth, [wbtc, weth]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", strategy);
    console.log("Info: ", this.adapterInfo.address);
    console.log("PickleSushiGaugeAdapter: ", this.aAdapter.address);

    this.pickle = await ethers.getContractAt("IBEP20", pickle);
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
      await expect(this.investor.depositETH(1, depositAmount.toString(), { gasPrice: 21e9 })).to.be.revertedWith(
        "Error: Insufficient ETH"
      );
    });

    it("(3) deposit should success for Alice", async function () {
      const depositAmount = ethers.utils.parseEther("10");
      await expect(
        this.investor.connect(this.alice).depositETH(1, depositAmount, {
          gasPrice: 21e9,
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositETH")
        .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

      const aliceInfo = (await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)).invested;
      expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(10);

      const aliceAdapterInfos = await this.aAdapter.userAdapterInfos(this.aliceAddr, 1);
      const adapterInfos = await this.aAdapter.adapterInfos(1);
      expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(BigNumber.from(aliceAdapterInfos.amount));

      // Check accTokenPerShare Info
      this.accTokenPerShare = (await this.aAdapter.adapterInfos(1)).accTokenPerShare;
      expect(BigNumber.from(this.accTokenPerShare)).to.eq(BigNumber.from(0));
    });

    it("(4) deposit should success for Bob", async function () {
      // wait 40 mins
      for (let i = 0; i < 7200; i++) {
        await ethers.provider.send("evm_mine", []);
      }
      await ethers.provider.send("evm_increaseTime", [3600 * 24]);
      await ethers.provider.send("evm_mine", []);

      const beforeAdapterInfos = await this.aAdapter.adapterInfos(1);
      const depositAmount = ethers.utils.parseEther("10");

      await expect(
        this.investor.connect(this.bob).depositETH(1, depositAmount, {
          gasPrice: 21e9,
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositETH")
        .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

      await expect(
        this.investor.connect(this.bob).depositETH(1, depositAmount, {
          gasPrice: 21e9,
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositETH")
        .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

      const bobInfo = (await this.aAdapter.userAdapterInfos(this.bobAddr, 1)).invested;
      expect(Number(bobInfo) / Math.pow(10, 18)).to.eq(20);

      const bobAdapterInfos = await this.aAdapter.userAdapterInfos(this.bobAddr, 1);
      expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

      const afterAdapterInfos = await this.aAdapter.adapterInfos(1);

      expect(BigNumber.from(afterAdapterInfos.totalStaked).gt(beforeAdapterInfos.totalStaked)).to.eq(true);

      // Check accTokenPerShare Info
      expect(
        BigNumber.from(
          (await this.aAdapter.adapterInfos(1)).accTokenPerShare
        ).gte(BigNumber.from(this.accTokenPerShare))
      ).to.eq(true);
      this.accTokenPerShare = (await this.aAdapter.adapterInfos(1)).accTokenPerShare;
    });

    it("(5) test claim, pendingReward function and protocol-fee", async function () {
      const beforeETH = await ethers.provider.getBalance(this.aliceAddr);
      const beforeETHOwner = await ethers.provider.getBalance(this.owner.address);
      const pending = await this.investor.pendingReward(1, this.aliceAddr);

      await this.investor.connect(this.alice).claim(1);
      const gasPrice = await ethers.provider.getGasPrice();
      const gas = await this.investor.connect(this.alice).estimateGas.claim(1);

      const afterETH = await ethers.provider.getBalance(this.aliceAddr);
      const protocolFee = (await ethers.provider.getBalance(this.owner.address)).sub(beforeETHOwner);
      const actualPending = afterETH.sub(beforeETH).add(gas.mul(gasPrice));
        
      if(pending > 0) {
        expect(pending).to.be.within(actualPending, actualPending.add(BigNumber.from(2e14))) &&
        expect(protocolFee).to.be.within(
          actualPending.mul(this.performanceFee).div(1e4),
          actualPending.add(BigNumber.from(2e14)).mul(this.performanceFee).div(1e4)
        );
      }
    });

    it("(6) test TVL & participants", async function () {
      const nftInfo = await this.adapterInfo.adapterInfo(1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(30) &&
        expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq("2");
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

      await expect(this.investor.connect(this.alice).withdrawETH(1, { gasPrice: 21e9 })).to.emit(
        this.investor,
        "WithdrawETH"
      );

      const afterETH = await ethers.provider.getBalance(this.aliceAddr);

      expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

      const aliceInfo = (await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)).invested;
      expect(aliceInfo).to.eq(BigNumber.from(0));

      const bobInfo = (await this.aAdapter.userAdapterInfos(this.bobAddr, 1)).invested;
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(20);

      expect(
        BigNumber.from((await this.aAdapter.adapterInfos(1)).accTokenPerShare).gt(BigNumber.from(this.accTokenPerShare))
      ).to.eq(true);

      this.accTokenPerShare = (await this.aAdapter.adapterInfos(1)).accTokenPerShare;
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

      await expect(this.investor.connect(this.bob).withdrawETH(1, { gasPrice: 21e9 })).to.emit(
        this.investor,
        "WithdrawETH"
      );

      const afterETH = await ethers.provider.getBalance(this.bobAddr);

      expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

      const bobInfo = (await this.aAdapter.userAdapterInfos(this.bobAddr, 1)).invested;
      expect(bobInfo).to.eq(BigNumber.from(0));

      // Check accTokenPerShare Info
      expect(
        BigNumber.from((await this.aAdapter.adapterInfos(1)).accTokenPerShare)
        .gte(BigNumber.from(this.accTokenPerShare))
      ).to.eq(true);

      this.accTokenPerShare = (await this.aAdapter.adapterInfos(1)).accTokenPerShare;
    });

    it("(5) test TVL & participants after Alice & Bob withdraw", async function () {
      const nftInfo = await this.adapterInfo.adapterInfo(1);

      expect(Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))).to.be.eq(0) &&
        expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq("0");
    });
  });
});
