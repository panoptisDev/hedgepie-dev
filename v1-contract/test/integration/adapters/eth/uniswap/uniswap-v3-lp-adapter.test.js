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

describe.only("UniswapV3LPAdapter Integration Test", function () {
  before("Deploy contract", async function () {
    await forkNetwork();

    const [owner, alice, bob, tom] = await ethers.getSigners();

    const performanceFee = 50;
    const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const Matic = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0";
    const strategy = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"; // NonfungiblePositionManager
    const stakingToken = "0x290A6a7460B308ee3F19023D2D00dE604bcf5B42"; // Matic-WETH Uniswap v3 pool
    const swapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 rounter address

    this.owner = owner;
    this.alice = alice;
    this.bob = bob;
    this.tom = tom;

    this.bobAddr = bob.address;
    this.aliceAddr = alice.address;
    this.tomAddr = tom.address;

    this.lower = -75480;
    this.upper = -75420;

    // Deploy Uniswap LP Adapter contract
    const uniswapV3LpAdapter = await ethers.getContractFactory("UniswapV3LPAdapter");
    this.aAdapter = await uniswapV3LpAdapter.deploy(
      strategy,
      stakingToken,
      swapRouter,
      this.lower,
      this.upper,
      "UniswapV3::Matic-WETH::LP"
    );
    await this.aAdapter.deployed();

    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    this.ybNft = await ybNftFactory.deploy();
    await this.ybNft.deployed();

    const Lib = await ethers.getContractFactory("HedgepieLibraryETH");
    const lib = await Lib.deploy();
    await lib.deployed();

    // Deploy Investor contract
    const investorFactory = await ethers.getContractFactory("HedgepieInvestorETH", {
      libraries: {
        HedgepieLibraryETH: lib.address,
      },
    });
    this.investor = await investorFactory.deploy(this.ybNft.address, swapRouter, weth);
    await this.investor.deployed();

    // Deploy Adaptor Manager contract
    const adapterManager = await ethers.getContractFactory("HedgepieAdapterManagerETH");
    this.adapterManager = await adapterManager.deploy();
    this.adapterManager.deployed();

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

    await this.aAdapter.setPath(weth, Matic, [weth, Matic]);
    await this.aAdapter.setPath(Matic, weth, [Matic, weth]);

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", strategy);
    console.log("UniswapV3LPAdapter: ", this.aAdapter.address);

    this.weth = await ethers.getContractAt("IBEP20", weth);
    this.matic = await ethers.getContractAt("IBEP20", Matic);
    this.nft = await ethers.getContractAt("IBEP721", "0xC36442b4a4522E871399CD717aBDD847Ab11FE88");
  });

  describe("depositETH function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // deposit to nftID: 3
      const depositAmount = ethers.utils.parseEther("1");
      await expect(
        this.investor.connect(this.owner).depositETH(this.owner.address, 3, depositAmount.toString(), {
          value: depositAmount,
        })
      ).to.be.revertedWith("nft tokenId is invalid");
    });

    it("(2)should be reverted when amount is 0", async function () {
      // deposit to nftID: 1
      const depositAmount = ethers.utils.parseEther("0");
      await expect(
        this.investor.depositETH(this.owner.address, 1, depositAmount.toString(), {
          value: depositAmount,
        })
      ).to.be.revertedWith("Amount can not be 0");
    });

    it("(3)deposit should success for Alice", async function () {
      const depositAmount = ethers.utils.parseEther("100");

      await expect(
        this.investor.connect(this.alice).depositETH(this.aliceAddr, 1, depositAmount, {
          value: depositAmount,
        })
      )
        .to.emit(this.investor, "DepositETH")
        .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

      const aliceInfo = await this.investor.userInfo(this.aliceAddr, this.ybNft.address, 1);
      const aliceDeposit = Number(aliceInfo) / Math.pow(10, 18);
      expect(aliceDeposit).to.eq(100);

      const aliceAdapterInfos = await this.investor.userAdapterInfos(this.aliceAddr, 1, this.aAdapter.address);
      expect(BigNumber.from(aliceAdapterInfos.amount).gt(0)).to.eq(true);

      const adapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
      expect(BigNumber.from(adapterInfos.totalStaked).sub(BigNumber.from(aliceAdapterInfos.amount))).to.eq(0);

      const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(this.aliceAddr, 1);
      expect(BigNumber.from(aliceWithdrable)).to.eq(BigNumber.from(aliceAdapterInfos.amount));
    });

    // it("(4)deposit should success for Bob", async function () {
    //   const aliceAdapterInfos = await this.investor.userAdapterInfos(this.aliceAddr, 1, this.aAdapter.address);
    //   const beforeAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);

    //   const depositAmount = ethers.utils.parseEther("100");
    //   await expect(
    //     this.investor.connect(this.bob).depositETH(this.bobAddr, 1, depositAmount, {
    //       value: depositAmount,
    //     })
    //   )
    //     .to.emit(this.investor, "DepositETH")
    //     .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

    //     await expect(
    //         this.investor.connect(this.bob).depositETH(this.bobAddr, 1, depositAmount, {
    //           value: depositAmount,
    //         })
    //       )
    //         .to.emit(this.investor, "DepositETH")
    //         .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

    //   const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
    //   const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
    //   expect(bobDeposit).to.eq(200);

    //   const bobAdapterInfos = await this.investor.userAdapterInfos(this.bobAddr, 1, this.aAdapter.address);
    //   expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

    //   const afterAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
    //   expect(BigNumber.from(afterAdapterInfos.totalStaked).gt(beforeAdapterInfos.totalStaked)).to.eq(true);
    //   expect(BigNumber.from(afterAdapterInfos.totalStaked).sub(aliceAdapterInfos.amount)).to.eq(
    //     BigNumber.from(bobAdapterInfos.amount)
    //   );

    //   const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
    //   expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(bobAdapterInfos.amount));
    // }).timeout(50000000);

    // it("(5)deposit should success for Tom", async function () {
    //   const beforeAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);

    //   const depositAmount = ethers.utils.parseEther("30");
    //   await expect(
    //     this.investor.connect(this.tom).depositETH(this.tomAddr, 1, depositAmount, {
    //       value: depositAmount,
    //     })
    //   )
    //     .to.emit(this.investor, "DepositETH")
    //     .withArgs(this.tomAddr, this.ybNft.address, 1, depositAmount);

    //   const tomInfo = await this.investor.userInfo(this.tomAddr, this.ybNft.address, 1);
    //   const tomDeposit = Number(tomInfo) / Math.pow(10, 18);
    //   expect(tomDeposit).to.eq(30);

    //   const tomAdapterInfos = await this.investor.userAdapterInfos(this.tomAddr, 1, this.aAdapter.address);
    //   expect(BigNumber.from(tomAdapterInfos.amount).gt(0)).to.eq(true);

    //   const afterAdapterInfos = await this.investor.adapterInfos(1, this.aAdapter.address);
    //   expect(BigNumber.from(afterAdapterInfos.totalStaked).gt(beforeAdapterInfos.totalStaked)).to.eq(true);
    //   expect(BigNumber.from(afterAdapterInfos.totalStaked).sub(tomAdapterInfos.amount)).to.eq(
    //     BigNumber.from(beforeAdapterInfos.totalStaked)
    //   );

    //   const tomWithdrable = await this.aAdapter.getWithdrawalAmount(this.tomAddr, 1);
    //   expect(BigNumber.from(tomWithdrable)).to.eq(BigNumber.from(tomAdapterInfos.amount));
    // }).timeout(50000000);

    // it("(6) test TVL & participants", async function () {
    //     const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);
  
    //     expect(
    //       Number(ethers.utils.formatEther(BigNumber.from(nftInfo.tvl).toString()))
    //     ).to.be.eq(330) &&
    //       expect(BigNumber.from(nftInfo.totalParticipant).toString()).to.be.eq(
    //         "3"
    //       );
    // });
  });

  describe("WithdrawETH() function test", function () {
    it("(1)should be reverted when nft tokenId is invalid", async function () {
      // withdraw to nftID: 3
      await expect(this.investor.withdrawETH(this.owner.address, 3)).to.be.revertedWith("nft tokenId is invalid");
    });

    it("(2)should receive ETH successfully after withdraw function for Alice", async function () {
      // withdraw from nftId: 1
      const beforeETH = await ethers.provider.getBalance(this.aliceAddr);

      await expect(this.investor.connect(this.alice).withdrawETH(this.aliceAddr, 1)).to.emit(
        this.investor,
        "WithdrawETH"
      );

      console.log(await ethers.provider.getBalance(this.investor.address));

      const afterETH = await ethers.provider.getBalance(this.aliceAddr);
      expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

      const aliceInfo = await this.investor.userInfo(this.aliceAddr, this.ybNft.address, 1);
      expect(aliceInfo).to.eq(BigNumber.from(0));

      const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(this.aliceAddr, 1);
      expect(BigNumber.from(aliceWithdrable)).to.eq(BigNumber.from(0));

      const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
      const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
      expect(bobDeposit).to.eq(200);

      const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
      expect(BigNumber.from(bobWithdrable).gt(0)).to.eq(true);
    }).timeout(50000000);

    // it("(3)should receive ETH successfully after withdraw function for Bob", async function () {
    //   // withdraw from nftId: 1
    //   const beforeETH = await ethers.provider.getBalance(this.bobAddr);

    //   console.log(await ethers.provider.getBalance(this.investor.address));

    //   await expect(this.investor.connect(this.bob).withdrawETH(this.bobAddr, 1)).to.emit(
    //     this.investor,
    //     "WithdrawETH"
    //   );

    //   console.log(await ethers.provider.getBalance(this.investor.address));

    //   const afterETH = await ethers.provider.getBalance(this.bobAddr);
    //   expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

    //   const bobInfo = await this.investor.userInfo(this.bobAddr, this.ybNft.address, 1);
    //   expect(bobInfo).to.eq(BigNumber.from(0));

    //   const bobWithdrable = await this.aAdapter.getWithdrawalAmount(this.bobAddr, 1);
    //   expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(0));

    //   const tomInfo = await this.investor.userInfo(this.tomAddr, this.ybNft.address, 1);
    //   const tomDeposit = Number(tomInfo) / Math.pow(10, 18);
    //   expect(tomDeposit).to.eq(30);

    //   const tomWithdrable = await this.aAdapter.getWithdrawalAmount(this.tomAddr, 1);
    //   expect(BigNumber.from(tomWithdrable).gt(0)).to.eq(true);
    // }).timeout(50000000);

    // it("(4)should receive ETH successfully after withdraw function for Tom", async function () {
    //   // withdraw from nftId: 1
    //   const beforeETH = await ethers.provider.getBalance(this.tomAddr);

    //   console.log(await ethers.provider.getBalance(this.investor.address));

    //   await expect(this.investor.connect(this.tom).withdrawETH(this.tomAddr, 1)).to.emit(
    //     this.investor,
    //     "WithdrawETH"
    //   );

    //   console.log(await ethers.provider.getBalance(this.investor.address));

    //   const afterETH = await ethers.provider.getBalance(this.tomAddr);
    //   expect(BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))).to.eq(true);

    //   const tomInfo = await this.investor.userInfo(this.tomAddr, this.ybNft.address, 1);
    //   expect(tomInfo).to.eq(BigNumber.from(0));

    //   const tomWithdrable = await this.aAdapter.getWithdrawalAmount(this.tomAddr, 1);
    //   expect(tomWithdrable).to.eq(0);
    // }).timeout(50000000);
  });
});
