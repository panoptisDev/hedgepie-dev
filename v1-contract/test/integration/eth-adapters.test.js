const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkETHNetwork } = require("../shared/utilities");
const { adapterFixture } = require("../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("Global ETH Adapters Integration Test", function () {
    before("Deploy adapter contracts", async function () {
        await forkETHNetwork();

        const performanceFee = 100;
        const [owner, alice, bob, treasury] = await ethers.getSigners();

        this.ethAdapters = [];
        this.performanceFee = performanceFee;

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.treasuryAddr = treasury.address;

        // Get Adapter fixtures
        this.ethAdapters = [...(await deployAdapters())];

        // Deploy YBNFT contract
        const ybNftFactory = await ethers.getContractFactory("YBNFT");
        this.ybNft = await ybNftFactory.deploy();
        await this.ybNft.deployed();

        // deploy adapterinfo
        const AdapterInfo = await ethers.getContractFactory(
            "HedgepieAdapterInfoEth"
        );
        this.adapterInfo = await AdapterInfo.deploy();
        await this.adapterInfo.deployed();

        // Deploy Investor contract
        const InvestorFactory = await ethers.getContractFactory(
            "HedgepieInvestorEth"
        );
        this.investor = await InvestorFactory.deploy(
            this.ybNft.address,
            this.treasuryAddr,
            this.adapterInfo.address
        );
        await this.investor.deployed();

        // set manager in adapterInfo
        for (let i = 0; i < this.ethAdapters.length; i++) {
            await this.ethAdapters[i].setInvestor(this.investor.address);
            await this.adapterInfo.setManager(
                this.ethAdapters[i].address,
                true
            );
        }

        // Deploy Adaptor Manager contract
        const AdapterManager = await ethers.getContractFactory(
            "HedgepieAdapterManagerEth"
        );
        this.adapterManager = await AdapterManager.deploy();
        await this.adapterManager.deployed();

        // Mint NFTs
        // tokenID: 1
        await this.ybNft.mint(
            new Array(5).fill(10000 / 5),
            stakingTokens.slice(0, 5),
            this.ethAdapters.slice(0, 5).map((it) => it.address),
            performanceFee,
            "test tokenURI1"
        );

        // tokenID: 2
        await this.ybNft.mint(
            new Array(8).fill(10000 / 8),
            stakingTokens.slice(5, 13),
            this.ethAdapters.slice(5, 13).map((it) => it.address),
            performanceFee,
            "test tokenURI2"
        );

        // Set investor in adapter manager
        await this.adapterManager.setInvestor(this.investor.address);

        // Add Adapters to AdapterManager
        for (let i = 0; i < this.ethAdapters.length; i++) {
            await this.adapterManager.addAdapter(this.ethAdapters[i].address);
        }

        // Set adapter manager in investor
        await this.investor.setAdapterManager(this.adapterManager.address);

        console.log("Owner: ", this.owner.address);
        console.log("YBNFT: ", this.ybNft.address);
        console.log("Investor: ", this.investor.address);
        console.log("Manager: ", this.adapterManager.address);
        console.log("Info: ", this.adapterInfo.address, "\n");
        for (let i = 0; i < this.ethAdapters.length; i++) {
            console.log(
                params[i][params[i].length - 2],
                this.ethAdapters[i].address
            );
        }
    });

    describe("depositETH function test", function () {
        it("(1) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await this.investor
                .connect(this.alice)
                .depositETH(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                });

            for (let i = 0; i < 5; i++) {
                const aliceInfo = (
                    await this.ethAdapters[i].userAdapterInfos(
                        this.aliceAddr,
                        1
                    )
                ).invested;
                expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(2);

                const aliceAdapterInfos = await this.ethAdapters[
                    i
                ].userAdapterInfos(this.aliceAddr, 1);

                const adapterInfos = await this.ethAdapters[i].adapterInfos(1);
                expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                    BigNumber.from(aliceAdapterInfos.amount)
                );
            }
        });

        it("(2) deposit should success for Bob", async function () {
            // wait 40 mins by passing blocks
            for (let i = 0; i < 7200; i++) {
                await ethers.provider.send("evm_mine", []);
            }
            await ethers.provider.send("evm_increaseTime", [3600 * 24]);
            await ethers.provider.send("evm_mine", []);

            const depositAmount = ethers.utils.parseEther("20");
            await this.investor.connect(this.bob).depositETH(2, depositAmount, {
                gasPrice: 21e9,
                value: depositAmount,
            });

            for (let i = 5; i < 13; i++) {
                const bobInfo = (
                    await this.ethAdapters[i].userAdapterInfos(this.bobAddr, 2)
                ).invested;

                i === 10
                    ? expect(bobInfo).to.lte(
                          BigNumber.from(25).mul(BigNumber.from(10).pow(17))
                      )
                    : expect(Number(bobInfo) / Math.pow(10, 17)).to.eq(25);

                const bobAdapterInfos = await this.ethAdapters[
                    i
                ].userAdapterInfos(this.bobAddr, 2);

                const adapterInfos = await this.ethAdapters[i].adapterInfos(2);
                expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                    BigNumber.from(bobAdapterInfos.amount)
                );
            }
        });

        it("(3) test TVL & participants", async function () {
            const nftInfo1 = await this.adapterInfo.adapterInfo(1);
            const nftInfo2 = await this.adapterInfo.adapterInfo(2);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo1.tvl).toString()
                    )
                )
            ).to.be.eq(10) &&
                expect(
                    BigNumber.from(nftInfo1.participant).toString()
                ).to.be.eq("1") &&
                expect(
                    Number(
                        ethers.utils.formatEther(
                            BigNumber.from(nftInfo2.tvl).toString()
                        )
                    )
                ).to.gte(18) &&
                expect(
                    BigNumber.from(nftInfo2.participant).toString()
                ).to.be.eq("1");
        });
    });

    describe("withdrawETH() function test", function () {
        it("(1) should receive the ETH successfully after withdraw function for Alice", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.aliceAddr);

            await expect(
                this.investor
                    .connect(this.alice)
                    .withdrawETH(1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawETH");

            const afterETH = await ethers.provider.getBalance(this.aliceAddr);
            expect(
                BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))
            ).to.eq(true);

            for (let i = 0; i < 5; i++) {
                aliceInfo = (
                    await this.ethAdapters[i].userAdapterInfos(
                        this.aliceAddr,
                        1
                    )
                ).invested;
                expect(aliceInfo).to.eq(BigNumber.from(0));
            }
        });

        it("(2) should receive the ETH successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.aliceAddr);

            await expect(
                this.investor
                    .connect(this.bob)
                    .withdrawETH(2, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawETH");

            const afterETH = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))
            ).to.eq(true);

            for (let i = 5; i < 13; i++) {
                bobInfo = (
                    await this.ethAdapters[i].userAdapterInfos(this.bobAddr, 2)
                ).invested;
                expect(bobInfo).to.eq(BigNumber.from(0));
            }
        });

        it("(3) test TVL & participants after Alice & Bob withdraw", async function () {
            const nftInfo1 = await this.adapterInfo.adapterInfo(1);
            const nftInfo2 = await this.adapterInfo.adapterInfo(2);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo1.tvl).toString()
                    )
                )
            ).to.be.eq(0) &&
                expect(
                    BigNumber.from(nftInfo1.participant).toString()
                ).to.be.eq("0") &&
                expect(
                    Number(
                        ethers.utils.formatEther(
                            BigNumber.from(nftInfo2.tvl).toString()
                        )
                    )
                ).to.be.eq(0) &&
                expect(
                    BigNumber.from(nftInfo2.participant).toString()
                ).to.be.eq("0");
        });
    });
});

const params = [
    [
        //AAVE::Lend::CRV
        "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", // Strategy: LendingPool
        "0xD533a949740bb3306d119CC777fa900bA034cd52", // StakingToken: CRV
        "0x8dAE6Cb04688C62d939ed9B68d32Bc62e49970b1", // RewardToken: aCRV
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", // SwapRouter: SushiRouter
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "AAVE::Lend::CRV",
        [
            [
                "0xd533a949740bb3306d119cc777fa900ba034cd52",
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            ],
        ],
    ],
    [
        // Balancer::Vault::wsETH-Compound
        "0x496ff26b76b8d23bbc6cf1df1eee4a48795490f7000200000000000000000377",
        "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Strategy: Balancer Vault
        "0x496ff26B76b8d23bbc6cF1Df1eeE4a48795490F7", // RepayToken: Balancer 50COMP-50wstETH
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", // SwapRouter: SushiRouter
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        [
            // Reward Tokens
            "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH
            "0xc00e94Cb662C3520282E6f5717214004A7f26888", // Compound
        ],
        "Balancer::Vault::wsETH-Compound",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0xc00e94Cb662C3520282E6f5717214004A7f26888",
            ],
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
                "0x6b175474e89094c44da98b954eedeac495271d0f",
            ],
        ],
    ],
    [
        // COMPOUND::Lend::DAI
        "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // Strategy: cDAI Token
        "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B", // Comptroller
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // StakingToken: DAI
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", // SwapRouter: SushiRouter
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "COMPOUND::Lend::DAI",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            ],
        ],
    ],
    [
        // CURVE::Gauge::cDAI/cUSDC
        "0x7ca5b0a2910B33e9759DC7dDB0413949071D7575",
        "0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2",
        "0xD533a949740bb3306d119CC777fa900bA034cd52",
        "0xeB21209ae4C2c9FF2a86ACA31E123764A3B6Bc06",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        {
            rewardMinter: "0xd061D61a4d941c39E5453435B6345Dc261C2fcE0",
            liquidityToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            lpCnt: 2,
            lpOrder: 1,
        },
        "Curve::Gauge::cDAI/cUSDC",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0xD533a949740bb3306d119CC777fa900bA034cd52",
            ],
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            ],
        ],
    ],
    [
        // Pickle::Curve::CRV-ETH
        "0x4801154c499C37cFb524cdb617995331fF618c4E",
        "0x1c5Dbb5d9864738e84c126782460C18828859648",
        "0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d",
        "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
        "0x0000000000000000000000000000000000000000",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        {
            liquidityToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            lpCnt: 2,
            lpOrder: 0,
        },
        "Pickle::Curve::CRV-ETH",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
            ],
        ],
    ],
    [
        // Pickle::Single::Loops
        "0x06A566E7812413bc66215b48D6F26321Ddf653A9",
        "0xb4EBc2C371182DeEa04B2264B9ff5AC4F0159C69",
        "0xf4d2888d29D722226FafA5d9B24F9164c092421E",
        "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
        "0x0000000000000000000000000000000000000000",
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "Pickle::Single::Loops",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
            ],
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0xf4d2888d29D722226FafA5d9B24F9164c092421E",
            ],
        ],
    ],
    [
        // Pickle::Sushi::WBTC-ETH
        "0xD55331E7bCE14709d825557E5Bca75C73ad89bFb",
        "0xde74b6c547bd574c3527316a2eE30cd8F6041525",
        "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58",
        "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
        "0x0000000000000000000000000000000000000000",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "Pickle::Sushi::WBTC-ETH",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
            ],
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            ],
        ],
    ],
    [
        // Pickle::Sushi::WBTC-ETH
        20,
        "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d",
        "0xde74b6c547bd574c3527316a2eE30cd8F6041525",
        "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58",
        "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
        "0x0000000000000000000000000000000000000000",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "Pickle::Sushi::WBTC-ETH",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
            ],
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            ],
        ],
    ],
    [
        // Sushi Farm adapter
        12,
        "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd",
        "0x795065dCc9f64b5614C407a6EFDC400DA6221FB0",
        "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "SushiSwap::Farm::SUSHI-WETH",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
            ],
        ],
    ],
    [
        // Sushi FarmV2 adapter
        42,
        "0xef0881ec094552b2e128cf945ef17a6752b4ec5d",
        "0x559eBE4E206e6B4D50e9bd3008cDA7ce640C52cb",
        "0x44709a920fCcF795fbC57BAA433cc3dd53C44DbE",
        "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "SushiSwap::Farm::RADAR-ETH",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
            ],
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x44709a920fCcF795fbC57BAA433cc3dd53C44DbE",
            ],
        ],
    ],
    [
        // Uniswap V3 adaper
        "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        "0x290A6a7460B308ee3F19023D2D00dE604bcf5B42",
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        -75480,
        -75420,
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "UniswapV3::Matic-WETH::LP",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
            ],
        ],
    ],
    [
        // Yearn Curve adatper
        "0x1635b506a88fBF428465Ad65d00e8d6B6E5846C3",
        "0x3A283D9c08E8b55966afb64C515f5143cf907611",
        "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4",
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        2,
        0,
        true,
        "Yearn::Curve CVX-ETH::Vault",
        [],
    ],
    [
        // Yearn Single adapter
        "0xF29AE508698bDeF169B89834F76704C3B205aedf",
        "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "Yearn::SNX::Vault",
        [
            [
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
            ],
        ],
    ],
];

const stakingTokens = [
    "0xD533a949740bb3306d119CC777fa900bA034cd52",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2",
    "0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d",
    "0xf4d2888d29D722226FafA5d9B24F9164c092421E",
    "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58",
    "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58",
    "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
    "0x44709a920fCcF795fbC57BAA433cc3dd53C44DbE",
    "0x290A6a7460B308ee3F19023D2D00dE604bcf5B42",
    "0x3A283D9c08E8b55966afb64C515f5143cf907611",
    "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
];

const deployAdapters = async () => {
    let adapters = [];
    let adapterFixtures = [];

    // Get Adapter Fixtures
    adapterFixtures.push(await adapterFixture("AaveLendAdapterEth"));
    adapterFixtures.push(await adapterFixture("BalancerVaultAdapterEth"));
    adapterFixtures.push(await adapterFixture("CompoundLendAdapterEth"));
    adapterFixtures.push(await adapterFixture("CurveGaugeAdapter"));
    adapterFixtures.push(await adapterFixture("PickleCurveGaugeAdapter"));
    adapterFixtures.push(await adapterFixture("PickleSingleGaugeAdapter"));
    adapterFixtures.push(await adapterFixture("PickleSushiGaugeAdapter"));
    adapterFixtures.push(await adapterFixture("PickleSushiMasterAdapter"));
    adapterFixtures.push(await adapterFixture("SushiFarmAdapterEth"));
    adapterFixtures.push(await adapterFixture("SushiFarmV2AdapterEth"));
    adapterFixtures.push(await adapterFixture("UniswapV3LPAdapter"));
    adapterFixtures.push(await adapterFixture("YearnCurveAdapter"));
    adapterFixtures.push(await adapterFixture("YearnSingleAdapter"));

    // Deploy Adapters
    adapters.push(
        await adapterFixtures[0].deploy(
            params[0][0],
            params[0][1],
            params[0][2],
            params[0][3],
            params[0][4],
            params[0][5]
        )
    );
    adapters.push(
        await adapterFixtures[1].deploy(
            params[1][0],
            params[1][1],
            params[1][2],
            params[1][3],
            params[1][4],
            params[1][5],
            params[1][6]
        )
    );
    adapters.push(
        await adapterFixtures[2].deploy(
            params[2][0],
            params[2][1],
            params[2][2],
            params[2][3],
            params[2][4],
            params[2][5]
        )
    );
    adapters.push(
        await adapterFixtures[3].deploy(
            params[3][0],
            params[3][1],
            params[3][2],
            params[3][3],
            params[3][4],
            params[3][5],
            params[3][6],
            params[3][7]
        )
    );
    adapters.push(
        await adapterFixtures[4].deploy(
            params[4][0],
            params[4][1],
            params[4][2],
            params[4][3],
            params[4][4],
            params[4][5],
            params[4][6],
            params[4][7],
            params[4][8],
            params[4][9]
        )
    );
    adapters.push(
        await adapterFixtures[5].deploy(
            params[5][0],
            params[5][1],
            params[5][2],
            params[5][3],
            params[5][4],
            params[5][5],
            params[5][6],
            params[5][7]
        )
    );
    adapters.push(
        await adapterFixtures[6].deploy(
            params[6][0],
            params[6][1],
            params[6][2],
            params[6][3],
            params[6][4],
            params[6][5],
            params[6][6],
            params[6][7]
        )
    );
    adapters.push(
        await adapterFixtures[7].deploy(
            params[7][0],
            params[7][1],
            params[7][2],
            params[7][3],
            params[7][4],
            params[7][5],
            params[7][6],
            params[7][7],
            params[7][8]
        )
    );
    adapters.push(
        await adapterFixtures[8].deploy(
            params[8][0],
            params[8][1],
            params[8][2],
            params[8][3],
            params[8][4],
            params[8][5],
            params[8][6],
            params[8][7]
        )
    );
    adapters.push(
        await adapterFixtures[9].deploy(
            params[9][0],
            params[9][1],
            params[9][2],
            params[9][3],
            params[9][4],
            params[9][5],
            params[9][6],
            params[9][7],
            params[9][8]
        )
    );
    adapters.push(
        await adapterFixtures[10].deploy(
            params[10][0],
            params[10][1],
            params[10][2],
            params[10][3],
            params[10][4],
            params[10][5],
            params[10][6]
        )
    );
    adapters.push(
        await adapterFixtures[11].deploy(
            params[11][0],
            params[11][1],
            params[11][2],
            params[11][3],
            params[11][4],
            params[11][5],
            params[11][6],
            params[11][7],
            params[11][8],
            params[11][9]
        )
    );
    adapters.push(
        await adapterFixtures[12].deploy(
            params[12][0],
            params[12][1],
            params[12][2],
            params[12][3],
            params[12][4]
        )
    );

    // Deploy Adapters
    for (let i = 0; i < adapters.length; i++) {
        await adapters[i].deployed();

        for (let j = 0; j < params[i][params[i].length - 1].length; j++) {
            await setPath(
                adapters[i],
                params[i][params[i].length - 1][j][0],
                params[i][params[i].length - 1][j][1],
                params[i][params[i].length - 1][j].length === 3
                    ? params[i][params[i].length - 1][j][2]
                    : null
            );
        }
    }

    return adapters;
};
