const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkETHNetwork } = require("../../../../shared/utilities");
const {
    adapterFixture,
    investorFixture,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

const adapterParams = [
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
        "0xe65cdB6479BaC1e22340E4E755fAE7E509EcD06c", // Strategy: cAAVE Token
        "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B", // Comptroller
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // StakingToken: DAI
        "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", // SwapRouter: SushiRouter
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "COMPOUND::Lend::DAI",
        [
            [
                "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
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
    cadapterFixtures.push(await adapterFixture("YearnSingleAdapter"));

    // Deploy Adapters
    for (let i = 0; i < adapterFixtures.length; i++) {
        adapters.push(await adapterFixtures[i].deploy(adapterParams[i]));

        for (
            let j = 0;
            j < adapterFixtures[i][adapterFixtures[i].length - 1].length;
            j++
        ) {
            await setPath(
                adapters[i],
                adapterFixtures[i][adapterFixtures[i].length - 1][0],
                adapterFixtures[i][adapterFixtures[i].length - 1][1],
                adapterFixtures[i][adapterFixtures[i].length - 1].length === 2
                    ? adapterFixtures[i][adapterFixtures[i].length - 1][2]
                    : null
            );
        }
    }

    return adapters;
};

describe("ETH Adapters Integration Test", function () {
    before("Deploy contract", async function () {
        this.ethAdapters = [];
        await forkETHNetwork();

        const [owner, alice, bob, treasury] = await ethers.getSigners();

        const performanceFee = 100;
        const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const aUSDC = "0xBcca60bB61934080951369a648Fb03DF4F96263C";
        const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        const strategy = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"; // LendingPool
        const swapRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"; // sushi router
        const stakingToken = usdc;

        this.performanceFee = performanceFee;

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.treasuryAddr = treasury.address;

        this.accTokenPerShare = BigNumber.from(0);
        this.accTokenPerShare1 = BigNumber.from(0);

        // Get Adapter fixtures
        this.ethAdapters = [...(await deployAdapters())];
        console.log(this.ethAdapters);

        this.adapter = await AaveFarmAdapter.deploy(
            strategy,
            usdc,
            aUSDC,
            swapRouter,
            weth,
            "AAVE::Lend::USDC"
        );
        await this.adapter.deployed();

        [this.adapterInfo, this.investor] = await investorFixture(
            this.adapter,
            treasury.address,
            stakingToken,
            performanceFee
        );

        await setPath(this.adapter, weth, usdc);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("Info: ", this.adapterInfo.address);
        console.log("AaveLendAdapterEth: ", this.adapter.address);
    });

    describe("depositETH function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositETH(3, depositAmount.toString(), {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositETH(1, depositAmount.toString(), {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("Error: Insufficient ETH");
        });

        it("(3) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await this.investor
                .connect(this.alice)
                .depositETH(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                });

            const aliceInfo = (
                await this.adapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;
            expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(10);

            const aliceAdapterInfos = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            const adapterInfos = await this.adapter.adapterInfos(1);
            expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                BigNumber.from(aliceAdapterInfos.amount)
            );

            // Check accTokenPerShare Info
            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare;
            expect(BigNumber.from(this.accTokenPerShare)).to.eq(
                BigNumber.from(0)
            );
        });

        it("(4) deposit should success for Bob", async function () {
            // wait 40 mins
            for (let i = 0; i < 7200; i++) {
                await ethers.provider.send("evm_mine", []);
            }
            await ethers.provider.send("evm_increaseTime", [3600 * 24]);
            await ethers.provider.send("evm_mine", []);

            const beforeAdapterInfos = await this.adapter.adapterInfos(1);
            const depositAmount = ethers.utils.parseEther("10");

            await this.investor.connect(this.bob).depositETH(1, depositAmount, {
                gasPrice: 21e9,
                value: depositAmount,
            });

            await this.investor.connect(this.bob).depositETH(1, depositAmount, {
                gasPrice: 21e9,
                value: depositAmount,
            });

            const bobInfo = (
                await this.adapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;
            expect(Number(bobInfo) / Math.pow(10, 18)).to.eq(20);

            const bobAdapterInfos = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

            const afterAdapterInfos = await this.adapter.adapterInfos(1);

            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).gt(
                    beforeAdapterInfos.totalStaked
                )
            ).to.eq(true);

            // Check accTokenPerShare Info
            expect(
                BigNumber.from(
                    (await this.adapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare;
        });

        it("(5) test claim, pendingReward function and protocol-fee", async function () {
            const beforeETH = await ethers.provider.getBalance(this.aliceAddr);
            const beforeETHOwner = await ethers.provider.getBalance(
                this.treasuryAddr
            );

            const pending = await this.investor.pendingReward(
                1,
                this.aliceAddr
            );

            const gasPrice = await ethers.provider.getGasPrice();
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.claim(1);
            await this.investor.connect(this.alice).claim(1);

            const afterETH = await ethers.provider.getBalance(this.aliceAddr);
            const protocolFee = (
                await ethers.provider.getBalance(this.treasuryAddr)
            ).sub(beforeETHOwner);
            const actualPending = afterETH
                .sub(beforeETH)
                .add(gas.mul(gasPrice));

            expect(pending).to.be.within(
                actualPending.sub(BigNumber.from(8e13)),
                actualPending
            ) &&
                expect(protocolFee).to.be.within(
                    actualPending
                        .sub(BigNumber.from(8e13))
                        .mul(this.performanceFee)
                        .div(1e4),
                    actualPending.mul(this.performanceFee).div(1e4)
                );
        });

        it("(6) test TVL & participants", async function () {
            const nftInfo = await this.adapterInfo.adapterInfo(1);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo.tvl).toString()
                    )
                )
            ).to.be.eq(30) &&
                expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq(
                    "2"
                );
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
            await expect(
                this.investor
                    .connect(this.owner)
                    .withdrawETH(3, { gasPrice: 21e9 })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should receive the ETH successfully after withdraw function for Alice", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.aliceAddr);
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let aliceInfo = (
                await this.adapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.withdrawETH(1, { gasPrice });
            await expect(
                this.investor.connect(this.alice).withdrawETH(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawETH");

            const afterETH = await ethers.provider.getBalance(this.aliceAddr);
            expect(
                BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterETH.sub(beforeETH);
            const afterOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(aliceInfo)) {
                actualPending = actualPending.sub(BigNumber.from(aliceInfo));
                const protocolFee = afterOwnerETH.sub(beforeOwnerETH);
                expect(protocolFee).to.gt(0);
                expect(actualPending).to.be.within(
                    protocolFee
                        .mul(1e4 - this.performanceFee)
                        .div(this.performanceFee)
                        .sub(gas.mul(gasPrice)),
                    protocolFee
                        .mul(1e4 - this.performanceFee)
                        .div(this.performanceFee)
                        .add(gas.mul(gasPrice))
                );
            }

            aliceInfo = (await this.adapter.userAdapterInfos(this.aliceAddr, 1))
                .invested;
            expect(aliceInfo).to.eq(BigNumber.from(0));

            const bobInfo = (
                await this.adapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;
            const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
            expect(bobDeposit).to.eq(20);

            expect(
                BigNumber.from(
                    (await this.adapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare;
        });

        it("(3) test TVL & participants after Alice withdraw", async function () {
            const nftInfo = await this.adapterInfo.adapterInfo(1);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo.tvl).toString()
                    )
                )
            ).to.be.eq(20) &&
                expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq(
                    "1"
                );
        });

        it("(4) should receive the ETH successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.bobAddr);
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let bobInfo = (await this.adapter.userAdapterInfos(this.bobAddr, 1))
                .invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.bob)
                .estimateGas.withdrawETH(1, { gasPrice });
            await expect(
                this.investor.connect(this.bob).withdrawETH(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawETH");

            const afterETH = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterETH.sub(beforeETH);
            const afterOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(bobInfo)) {
                actualPending = actualPending.sub(BigNumber.from(bobInfo));
                const protocolFee = afterOwnerETH.sub(beforeOwnerETH);
                expect(protocolFee).to.gt(0);
                expect(actualPending).to.be.within(
                    protocolFee
                        .mul(1e4 - this.performanceFee)
                        .div(this.performanceFee)
                        .sub(gas.mul(gasPrice)),
                    protocolFee
                        .mul(1e4 - this.performanceFee)
                        .div(this.performanceFee)
                        .add(gas.mul(gasPrice))
                );
            }

            bobInfo = (await this.adapter.userAdapterInfos(this.bobAddr, 1))
                .invested;
            expect(bobInfo).to.eq(BigNumber.from(0));

            // Check accTokenPerShare Info
            expect(
                BigNumber.from(
                    (await this.adapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare;
        });

        it("(5) test TVL & participants after Alice & Bob withdraw", async function () {
            const nftInfo = await this.adapterInfo.adapterInfo(1);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo.tvl).toString()
                    )
                )
            ).to.be.eq(0) &&
                expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq(
                    "0"
                );
        });
    });
});
