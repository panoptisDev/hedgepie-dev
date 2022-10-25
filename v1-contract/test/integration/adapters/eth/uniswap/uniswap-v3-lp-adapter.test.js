const { expect } = require("chai");
const { ethers } = require("hardhat");

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

describe("UniswapV3LPAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    await forkNetwork();

    const [owner, alice, bob, tom, treasury] = await ethers.getSigners();

    const performanceFee = 50;
    const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const matic = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0";
    const strategy = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"; // NonfungiblePositionManager
    const stakingToken = "0x290A6a7460B308ee3F19023D2D00dE604bcf5B42"; // Matic-WETH Uniswap v3 pool
    const swapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 router address

    this.owner = owner;
    this.alice = alice;
    this.bob = bob;
    this.tom = tom;

    this.bobAddr = bob.address;
    this.aliceAddr = alice.address;
    this.tomAddr = tom.address;
    this.treasuryAddr = treasury.address;

    this.lower = -75480;
    this.upper = -75420;

    // Deploy UniswapV3LPAdapter contract
    const Lib = await ethers.getContractFactory("HedgepieLibraryEth");
    const lib = await Lib.deploy();
    const UniswapV3LpAdapter = await ethers.getContractFactory(
      "UniswapV3LPAdapter",
      {
        libraries: {
          HedgepieLibraryEth: lib.address,
        },
      }
    );
    this.adapter = await UniswapV3LpAdapter.deploy(
      strategy,
      stakingToken,
      swapRouter,
      this.lower,
      this.upper,
      weth,
      "UniswapV3::Matic-WETH::LP"
    );
    await this.adapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();

    // Deploy Adaptor Info contract
    const adapterInfo = await ethers.getContractFactory(
      "HedgepieAdapterInfoEth"
    );
    this.adapterInfo = await adapterInfo.deploy();
    await this.adapterInfo.setManager(this.adapter.address, true);

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory(
      "HedgepieInvestorEth"
    );
    this.investor = await investorFactory.deploy(
      this.ybNft.address,
      this.treasuryAddr,
      this.adapterInfo.address
    );

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory(
      "HedgepieAdapterManagerEth"
    );
    this.adapterManager = await adapterManager.deploy();

    // set investor
    await this.adapter.setInvestor(this.investor.address);

    // Mint NFTs
    // tokenID: 1
    await this.ybNft.mint(
      [10000],
      [stakingToken],
      [this.adapter.address],
      performanceFee,
      "test tokenURI1"
    );

    // tokenID: 2
    await this.ybNft.mint(
      [10000],
      [stakingToken],
      [this.adapter.address],
      performanceFee,
      "test tokenURI2"
    );

    // Add UniswapV3LPAdapter to AdapterManager
    await this.adapterManager.addAdapter(this.adapter.address);

    // Set investor in adapter manager
    await this.adapterManager.setInvestor(this.investor.address);

    // Set adapter manager in investor
    await this.investor.setAdapterManager(this.adapterManager.address);
    await this.investor.setTreasury(this.owner.address);

    // Set investor in UniswapV3LPAdapter
    await this.adapter.setInvestor(this.investor.address);

    // set path
    await this.adapter.setPath(weth, matic, [weth, matic]);
    await this.adapter.setPath(matic, weth, [matic, weth]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", strategy);
    console.log("UniswapV3LPAdapter: ", this.adapter.address);
  });

  describe("depositETH function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // deposit to nftID: 3
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor
          .connect(this.owner)
          .depositETH(3, depositAmount.toString(), {
            value: depositAmount,
          })
      ).to.be.revertedWith("nft tokenId is invalid");
    });

    it("(2)should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.depositETH(1, depositAmount)
      ).to.be.revertedWith("Error: Insufficient ETH");
    });

    it("(3)deposit should success for Alice", async function () {
      const depositAmount = ethers.utils.parseEther("10");
      await expect(
        this.investor.connect(this.alice).depositETH(1, depositAmount, {
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositETH")
        .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

      // compare user info
      const aliceInfo = await this.adapter.userAdapterInfos(this.aliceAddr, 1);
      expect(aliceInfo.invested).to.eq(depositAmount);
      expect(aliceInfo.amount).to.be.gt(0);

      // compare adapter info
      const adapterInfos = await this.adapter.adapterInfos(1);
      expect(adapterInfos.totalStaked).to.eq(aliceInfo.amount);
    });

    it("(4)deposit should success for Bob", async function () {
      const adapterInfoBefore = await this.adapter.adapterInfos(1);
      const depositAmount = ethers.utils.parseEther("10");
      await this.investor.connect(this.bob).depositETH(1, depositAmount, {
        value: depositAmount,
      });
      await this.investor.connect(this.bob).depositETH(1, depositAmount, {
        value: depositAmount,
      });

      // compare user info
      const bobInfo = await this.adapter.userAdapterInfos(this.bobAddr, 1);
      expect(bobInfo.invested).to.eq(ethers.utils.parseEther("20"));
      expect(bobInfo.amount).to.be.gt(0);

      // compare adapter info
      const adapterInfoAfter = await this.adapter.adapterInfos(1);
      expect(adapterInfoAfter.totalStaked).to.be.gt(
        adapterInfoBefore.totalStaked
      );
    }).timeout(50000000);

    it("(5)deposit should success for Tom", async function () {
      const adapterInfoBefore = await this.adapter.adapterInfos(1);
      const depositAmount = ethers.utils.parseEther("30");
      await this.investor.connect(this.tom).depositETH(1, depositAmount, {
        value: depositAmount,
      });

      // compare user info
      const tomInfo = await this.adapter.userAdapterInfos(this.tomAddr, 1);
      expect(tomInfo.invested).to.eq(ethers.utils.parseEther("30"));
      expect(tomInfo.amount).to.be.gt(0);

      // compare adapter info
      const adapterInfoAfter = await this.adapter.adapterInfos(1);
      expect(adapterInfoAfter.totalStaked).to.be.gt(
        adapterInfoBefore.totalStaked
      );
    }).timeout(50000000);

    it("(6)test TVL & participants", async function () {
      const nftInfo = await this.adapterInfo.adapterInfo(1);
      expect(nftInfo.tvl).to.be.eq(ethers.utils.parseEther("60"));
      expect(nftInfo.participant).to.be.eq("3");
    });
  });

  describe("withdrawETH() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(this.investor.withdrawETH(3)).to.be.revertedWith(
        "Error: nft tokenId is invalid"
      );
    });

    it("(2)should receive ETH successfully after withdraw function for Alice", async function () {
      const ethBalBefore = await ethers.provider.getBalance(this.aliceAddr);
      await expect(
        this.investor.connect(this.alice).withdrawETH(1, { gasPrice: 21e9 })
      ).to.emit(this.investor, "WithdrawETH");
      const ethBalAfter = await ethers.provider.getBalance(this.aliceAddr);

      // compare user info
      expect(ethBalAfter).to.gt(ethBalBefore);

      // compare adapter info
      const aliceAdapterInfo = await this.adapter.userAdapterInfos(
        this.aliceAddr,
        1
      );
      expect(aliceAdapterInfo.invested).to.eq("0");
    }).timeout(50000000);

    it("(3)should receive ETH successfully after withdraw function for Bob", async function () {
      const ethBalBefore = await ethers.provider.getBalance(this.bobAddr);
      await expect(this.investor.connect(this.bob).withdrawETH(1)).to.emit(
        this.investor,
        "WithdrawETH"
      );
      const ethBalAfter = await ethers.provider.getBalance(this.bobAddr);

      // compare user info
      expect(ethBalAfter).to.gt(ethBalBefore);

      // compare adapter info
      const bobAdapterInfo = await this.adapter.userAdapterInfos(
        this.bobAddr,
        1
      );
      expect(bobAdapterInfo.invested).to.eq("0");
    }).timeout(50000000);

    it("(4)should receive ETH successfully after withdraw function for Tom", async function () {
      const ethBalBefore = await ethers.provider.getBalance(this.tomAddr);
      await expect(this.investor.connect(this.tom).withdrawETH(1)).to.emit(
        this.investor,
        "WithdrawETH"
      );
      const ethBalAfter = await ethers.provider.getBalance(this.tomAddr);

      // compare user info
      expect(ethBalAfter).to.gt(ethBalBefore);

      // compare adapter info
      const tomAdapterInfo = await this.adapter.userAdapterInfos(
        this.tomAddr,
        1
      );
      expect(tomAdapterInfo.invested).to.eq("0");
    }).timeout(50000000);
  });
});
