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

describe("YBNFT capability for editing strategy Test", function () {
    before("Deploy contract", async function () {
        await forkNetwork();

        const [owner, treasury] = await ethers.getSigners();

        const performanceFee = 100;
        const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const aUSDC = "0xBcca60bB61934080951369a648Fb03DF4F96263C";
        const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        const strategy = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"; // LendingPool
        const stakingToken = usdc;

        this.performanceFee = performanceFee;
        this.weth = weth;
        this.usdc = usdc;
        this.stakingToken = stakingToken;

        this.owner = owner;
        this.sushiRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
        this.treasuryAddr = treasury.address;
        this.accTokenPerShare = BigNumber.from(0);
        this.accTokenPerShare1 = BigNumber.from(0);

        // Deploy Pancakeswap LP Adapter contract
        const Lib = await ethers.getContractFactory("HedgepieLibraryEth");
        const lib = await Lib.deploy();
        const AaveFarmAdapter = await ethers.getContractFactory(
            "AaveLendAdapterEth",
            {
                libraries: {
                    HedgepieLibraryEth: lib.address,
                },
            }
        );

        // Deploy two adapters
        this.adapter1 = await AaveFarmAdapter.deploy(
            strategy,
            usdc,
            aUSDC,
            this.sushiRouter,
            "AAVE::Lend::USDC",
            weth
        );
        await this.adapter1.deployed();
        this.adapter2 = await AaveFarmAdapter.deploy(
            strategy,
            usdc,
            aUSDC,
            this.sushiRouter,
            "AAVE::Lend::USDC",
            weth
        );
        await this.adapter2.deployed();

        // Deploy YBNFT contract
        const ybNftFactory = await ethers.getContractFactory("YBNFT");
        this.ybNft = await ybNftFactory.deploy();

        // Deploy Adaptor Info contract
        const adapterInfo = await ethers.getContractFactory(
            "HedgepieAdapterInfoEth"
        );
        this.adapterInfo = await adapterInfo.deploy();
        await this.adapterInfo.setManager(this.adapter1.address, true);
        await this.adapterInfo.setManager(this.adapter2.address, true);

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
        await this.adapter1.setInvestor(this.investor.address);
        await this.adapter2.setInvestor(this.investor.address);

        // Mint NFTs
        // tokenID: 1
        await this.ybNft.mint(
            [5000, 5000],
            [stakingToken, stakingToken],
            [this.adapter1.address, this.adapter2.address],
            performanceFee,
            "test tokenURI1"
        );

        // tokenID: 2
        await this.ybNft.mint(
            [4000, 6000],
            [stakingToken, stakingToken],
            [this.adapter1.address, this.adapter2.address],
            performanceFee,
            "test tokenURI2"
        );

        // Add AAVE Adapters to AdapterManager
        await this.adapterManager.addAdapter(this.adapter1.address);
        await this.adapterManager.addAdapter(this.adapter2.address);

        // Set investor in adapter manager
        await this.adapterManager.setInvestor(this.investor.address);

        // Set adapter manager in investor
        await this.investor.setAdapterManager(this.adapterManager.address);
        await this.investor.setTreasury(this.owner.address);

        // Set investor in AAVE adapter
        await this.adapter1.setInvestor(this.investor.address);
        await this.adapter2.setInvestor(this.investor.address);

        // Set paths for adapters
        await this.adapter1.setPath(this.weth, this.usdc, [
            this.weth,
            this.usdc,
        ]);
        await this.adapter1.setPath(this.usdc, this.weth, [
            this.usdc,
            this.weth,
        ]);
        await this.adapter2.setPath(this.weth, this.usdc, [
            this.weth,
            this.usdc,
        ]);
        await this.adapter2.setPath(this.usdc, this.weth, [
            this.usdc,
            this.weth,
        ]);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("Info: ", this.adapterInfo.address);
        console.log("AaveLendAdapterEth1: ", this.adapter1.address);
        console.log("AaveLendAdapterEth2: ", this.adapter2.address);
    });

    describe("Check init variables", function () {
        it("(1) check performance fee", async function () {
            expect(await this.ybNft.performanceFee(1)).to.eq(100) &&
                expect(await this.ybNft.performanceFee(2)).to.eq(100);
        });

        it("(2) check adaper information", async function () {
            const adapter0Info = await this.ybNft.adapterInfo(1, 0);
            const adapter1Info = await this.ybNft.adapterInfo(1, 1);

            expect(adapter0Info.token).to.eq(this.stakingToken) &&
                expect(adapter0Info.addr).to.eq(this.adapter1.address) &&
                expect(adapter0Info.allocation).to.eq(5000) &&
                expect(adapter1Info.token).to.eq(this.stakingToken) &&
                expect(adapter1Info.addr).to.eq(this.adapter2.address) &&
                expect(adapter1Info.allocation).to.eq(5000);
        });

        it("(3) check tokenURI", async function () {
            expect(await this.ybNft.tokenURI(1)).to.eq("test tokenURI1") &&
                expect(await this.ybNft.tokenURI(2)).to.eq("test tokenURI2");
        });
    });

    describe("Check capabilities to edit strategy", function () {
        it("(1) test capability to update performance fee", async function () {
            await expect(
                this.ybNft.updatePerformanceFee(1, 1000)
            ).to.be.revertedWith("Performance fee should be less than 10%");

            await this.ybNft.updatePerformanceFee(1, 500);
            await this.ybNft.updatePerformanceFee(2, 800);
            expect(await this.ybNft.performanceFee(1)).to.eq(500) &&
                expect(await this.ybNft.performanceFee(2)).to.eq(800);
        });

        it("(2) test capability to update adaper allocation", async function () {
            await expect(
                this.ybNft.updateAllocations(1, [1000, 10000])
            ).to.be.revertedWith("Incorrect adapter allocation");

            await this.ybNft.updateAllocations(1, [1000, 9000]);
            await this.ybNft.updateAllocations(2, [2000, 8000]);

            const adapter0Info = await this.ybNft.adapterInfo(1, 0);
            const adapter1Info = await this.ybNft.adapterInfo(1, 1);
            const adapter2Info = await this.ybNft.adapterInfo(2, 0);
            const adapter3Info = await this.ybNft.adapterInfo(2, 1);

            expect(adapter0Info.allocation).to.eq(1000) &&
                expect(adapter1Info.allocation).to.eq(9000) &&
                expect(adapter2Info.allocation).to.eq(2000) &&
                expect(adapter3Info.allocation).to.eq(8000);
        });

        it("(3) check tokenURI", async function () {
            await expect(
                this.ybNft.updateTokenURI(3, "tokenURI3")
            ).to.be.revertedWith("BEP721: owner query for nonexistent token");

            await this.ybNft.updateTokenURI(1, "tokenURI1");
            await this.ybNft.updateTokenURI(2, "tokenURI2");

            expect(await this.ybNft.tokenURI(1)).to.eq("tokenURI1") &&
                expect(await this.ybNft.tokenURI(2)).to.eq("tokenURI2");
        });
    });
});
