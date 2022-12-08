const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkPolygonNetwork } = require("../../../shared/utilities");
const { adapterFixtureMatic } = require("../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("Global MATIC Adapters Integration Test", function () {
    before("Deploy adapter contracts", async function () {
        await forkPolygonNetwork();

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
            "HedgepieAdapterInfoMatic"
        );
        this.adapterInfo = await AdapterInfo.deploy();
        await this.adapterInfo.deployed();

        // Deploy Investor contract
        const InvestorFactory = await ethers.getContractFactory(
            "HedgepieInvestorMatic"
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
            "HedgepieAdapterManagerMatic"
        );
        this.adapterManager = await AdapterManager.deploy();
        await this.adapterManager.deployed();

        // Mint NFTs
        // tokenID: 1
        await this.ybNft.mint(
            new Array(8).fill(10000 / 8),
            stakingTokens.slice(0, 8),
            this.ethAdapters.slice(0, 8).map((it) => it.address),
            performanceFee,
            "test tokenURI1"
        );

        // tokenID: 2
        await this.ybNft.mint(
            new Array(8).fill(10000 / 8),
            stakingTokens.slice(8, 17),
            this.ethAdapters.slice(8, 17).map((it) => it.address),
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

    describe("depositMATIC function test", function () {
        it("(1) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("40");
            await this.investor
                .connect(this.alice)
                .depositMATIC(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                });

            for (let i = 0; i < 8; i++) {
                const aliceInfo = (
                    await this.ethAdapters[i].userAdapterInfos(
                        this.aliceAddr,
                        1
                    )
                ).invested;
                expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(5);

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
            await this.investor
                .connect(this.bob)
                .depositMATIC(2, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                });

            for (let i = 8; i < 16; i++) {
                const bobInfo = (
                    await this.ethAdapters[i].userAdapterInfos(this.bobAddr, 2)
                ).invested;

                i === 15
                    ? expect(bobInfo).to.lte(depositAmount)
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
            ).to.be.eq(40) &&
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

    describe("withdrawMATIC() function test", function () {
        it("(1) should receive the MATIC successfully after withdraw function for Alice", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeMATIC = await ethers.provider.getBalance(
                this.aliceAddr
            );

            await expect(
                this.investor
                    .connect(this.alice)
                    .withdrawMATIC(1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawMATIC");

            const afterMATIC = await ethers.provider.getBalance(this.aliceAddr);
            expect(
                BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))
            ).to.eq(true);

            for (let i = 0; i < 8; i++) {
                aliceInfo = (
                    await this.ethAdapters[i].userAdapterInfos(
                        this.aliceAddr,
                        1
                    )
                ).invested;
                expect(aliceInfo).to.eq(BigNumber.from(0));
            }
        });

        it("(2) should receive the MATIC successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeMATIC = await ethers.provider.getBalance(this.bobAddr);

            await expect(
                this.investor
                    .connect(this.bob)
                    .withdrawMATIC(2, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawMATIC");

            const afterMATIC = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))
            ).to.eq(true);

            for (let i = 8; i < 16; i++) {
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
        // Aave::MarketV2::USDC
        "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf",
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "Aave::MarketV2::USDC",
        [
            [
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
        ],
    ],
    [
        // Aave::MarketV3::DAI
        "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
        "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "Aave::MarketV3::DAI",
        [
            [
                "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
        ],
    ],
    [
        // Apeswap::Farm::USDC-AXN LP
        16,
        "0x54aff400858Dcac39797a81894D9920f16972D1D",
        "0x81A3F6a138F0B12eCBDCE4583972A6CA57514dBd",
        "0x5d47bAbA0d66083C52009271faF3F50DCc01023C",
        "0x839F1a22A59eAAf26c85958712aB32F80FEA23d9",
        "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "Apeswap::Farm::USDC-AXN LP",
        [
            [
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
            [
                "0x839F1a22A59eAAf26c85958712aB32F80FEA23d9",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
            [
                "0x5d47bAbA0d66083C52009271faF3F50DCc01023C",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
        ],
    ],
    [
        // Apeswap::Farm::USDC-DAI LP
        5,
        "0x54aff400858Dcac39797a81894D9920f16972D1D",
        "0x5b13B583D4317aB15186Ed660A1E4C65C10da659",
        "0x5d47bAbA0d66083C52009271faF3F50DCc01023C",
        "0x0000000000000000000000000000000000000000",
        "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "Apeswap::Farm::USDC-DAI LP",
        [
            [
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
            [
                "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
            [
                "0x5d47bAbA0d66083C52009271faF3F50DCc01023C",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
        ],
    ],
    [
        // PolygonBeefy::Balancer USDC-ETH-BTC LP::Vault
        "0x866c72B76fca4785aEE3656C2064476f98Fe9Cc9",
        "0x03cD191F589d12b0582a99808cf19851E468E6B5",
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        {
            lpCnt: 3, // pool tokens count
            lpOrder: 2,
            poolId: "0x03cd191f589d12b0582a99808cf19851e468e6b500010000000000000000000a",
        },
        "PolygonBeefy::Balancer USDC-ETH-BTC LP::Vault",
        [
            [
                "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
        ],
    ],
    [
        // PolygonBeefy::Vault::LCD-Matic LP
        "0x8c9dE3b735a154d8fC1e94183eA9b021913AC88B",
        "0xAab5254e17380511887aabA7e96a5339A519E26a",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "PolygonBeefy::Vault::LCD-Matic LP",
        [
            [
                "0xc2A45FE7d40bCAc8369371B08419DDAFd3131b4a",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
        ],
    ],
    [
        // PolygonBeefy::QUICK::Vault
        "0x1A723371f9dc30653dafd826B60d9335bf867E35",
        "0xB5C064F955D8e7F38fE0460C556a72987494eE17",
        "0x0000000000000000000000000000000000000000",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "PolygonBeefy::QUICK::Vault",
        [
            [
                "0xB5C064F955D8e7F38fE0460C556a72987494eE17",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
        ],
    ],
    [
        // PolygonBeefy::Stargate-USDC-LP::Vault
        1,
        "0x2F4BBA9fC4F77F16829F84181eB7C8b50F639F95",
        "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "PolygonBeefy::Stargate-USDC-LP::Vault",
        [
            [
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            ],
        ],
    ],
    [
        // Curve::a3Crv::Gauge
        "0x19793B454D3AfC7b454F206Ffe95aDE26cA6912c",
        "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171",
        "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "0x445FE580eF8d70FF569aB36e80c647af338db351",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        {
            liquidityToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            lpCnt: 3,
            lpOrder: 1,
            underlying: true,
            isDeposit: false,
        },
        "Curve::a3Crv::Gauge",
        [
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
            ],
        ],
    ],
    [
        // Curve::crvEURSUSD::Gauge
        "0x40c0e9376468b4f257d15f8c47e5d0c646c28880",
        "0x600743B1d8A96438bD46836fD34977a00293f6Aa",
        "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
        "0x0000000000000000000000000000000000000000",
        "0x225fb4176f0e20cdb66b4a3df70ca3063281e855",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
        {
            liquidityToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            lpCnt: 4,
            lpOrder: 2,
            underlying: false,
            isDeposit: true,
        },
        "Curve::crvEURSUSD::Gauge",
        [
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            ],
        ],
    ],
    [
        // Quickswap::Matic-stMatic::LP-Dual
        "0x8ECbc9B0741C000fd7aaE9cb559e5eEe1D1883F3",
        "0x65752C54D9102BDFD69d351E1838A1Be83C924C6",
        "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",
        "0xC3C7d422809852031b44ab29EEC9F1EfF2A58756",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "Quickswap::Matic-stMatic::LP-Dual",
        [
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0xC3C7d422809852031b44ab29EEC9F1EfF2A58756",
            ],
        ],
    ],
    [
        // Quickswap::USDC-ASTRAFER::LP-Farm
        "0x1098d71eCD0233929DA8a10579E96cBbbe78f7C2",
        "0x01eBD3e57f4af47B7E96240e2B7B2227C902614A",
        "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "Quickswap::USDC-ASTRAFER::LP-Farm",
        [
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0xDfCe1e99A31C4597a3f8A8945cBfa9037655e335",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",
            ],
        ],
    ],
    [
        // Quickswap::Quick-IXT::Stake
        "0xF3ed4Fc825864a16CAb4b8946622222050c63f5E",
        "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
        "0xE06Bd4F5aAc8D0aA337D13eC88dB6defC6eAEefE",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "Quickswap::Quick-IXT::Stake",
        [
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0xE06Bd4F5aAc8D0aA337D13eC88dB6defC6eAEefE",
            ],
        ],
    ],
    [
        // Stargate::USDC::LPAdapter
        "0x8731d54E9D02c286767d56ac03e8037C07e01e98",
        [
            "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
            "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        ],
        "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
        "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
        [0, 1],
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "Stargate::USDC::LPAdapter",
        [
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
            ],
        ],
    ],
    [
        // SushiSwapLPAdapterMatic
        3,
        "0x0769fd68dfb93167989c6f7254cd0d766fb2841f",
        "0xE62Ec2e799305E0D367b0Cc3ee2CdA135bF89816",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
        "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
        "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "SushiSwapLPAdapterMatic",
        [
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
            ],
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            ],
        ],
    ],
    [
        // Uniswap::USDC-WMATIC::LPAdapter
        "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        "0xA374094527e1673A86dE625aa59517c5dE346d32",
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        -500000,
        -300000,
        "Uniswap::USDC-WMATIC::LPAdapter",
        [
            [
                "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
                "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            ],
        ],
    ],
];

const stakingTokens = [
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    "0x81A3F6a138F0B12eCBDCE4583972A6CA57514dBd",
    "0x5b13B583D4317aB15186Ed660A1E4C65C10da659",
    "0x03cD191F589d12b0582a99808cf19851E468E6B5",
    "0xAab5254e17380511887aabA7e96a5339A519E26a",
    "0xB5C064F955D8e7F38fE0460C556a72987494eE17",
    "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
    "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171",
    "0x600743B1d8A96438bD46836fD34977a00293f6Aa",
    "0x65752C54D9102BDFD69d351E1838A1Be83C924C6",
    "0x01eBD3e57f4af47B7E96240e2B7B2227C902614A",
    "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
    "0x1205f31718499dBf1fCa446663B532Ef87481fe1",
    "0xE62Ec2e799305E0D367b0Cc3ee2CdA135bF89816",
    "0xA374094527e1673A86dE625aa59517c5dE346d32",
];

const deployAdapters = async () => {
    let adapters = [];
    let adapterFixtures = [];

    // Get Adapter Fixtures
    adapterFixtures.push(await adapterFixtureMatic("AaveMarketV2AdapterMatic"));
    adapterFixtures.push(await adapterFixtureMatic("AaveMarketV3AdapterMatic"));
    adapterFixtures.push(await adapterFixtureMatic("ApeswapFarmAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("ApeswapFarmAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("BeefyBalancerAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("BeefyVaultAdapterMatic"));
    adapterFixtures.push(await adapterFixtureMatic("BeefyVaultAdapterMatic"));
    adapterFixtures.push(await adapterFixtureMatic("BeefyStargateAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("CurveLPAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("CurveLPAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("QuickLPDualAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("QuickLPFarmAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("QuickStakeAdapter"));
    adapterFixtures.push(await adapterFixtureMatic("StargateFarmAdapterMatic"));
    adapterFixtures.push(await adapterFixtureMatic("SushiSwapLPAdapterMatic"));
    adapterFixtures.push(await adapterFixtureMatic("UniswapLPAdapter"));

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
            params[1][5]
        )
    );

    adapters.push(
        await adapterFixtures[2].deploy(
            params[2][0],
            params[2][1],
            params[2][2],
            params[2][3],
            params[2][4],
            params[2][5],
            params[2][6],
            params[2][7]
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
            params[4][7]
        )
    );

    adapters.push(
        await adapterFixtures[5].deploy(
            params[5][0],
            params[5][1],
            params[5][2],
            params[5][3],
            params[5][4],
            params[5][5]
        )
    );

    adapters.push(
        await adapterFixtures[6].deploy(
            params[6][0],
            params[6][1],
            params[6][2],
            params[6][3],
            params[6][4],
            params[6][5]
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
            params[7][7]
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
            params[8][7],
            params[8][8]
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
            params[11][5]
        )
    );

    adapters.push(
        await adapterFixtures[12].deploy(
            params[12][0],
            params[12][1],
            params[12][2],
            params[12][3],
            params[12][4],
            params[12][5]
        )
    );

    adapters.push(
        await adapterFixtures[13].deploy(
            params[13][0],
            params[13][1],
            params[13][2],
            params[13][3],
            params[13][4],
            params[13][5],
            params[13][6],
            params[13][7]
        )
    );

    adapters.push(
        await adapterFixtures[14].deploy(
            params[14][0],
            params[14][1],
            params[14][2],
            params[14][3],
            params[14][4],
            params[14][5],
            params[14][6],
            params[14][7],
            params[14][8]
        )
    );

    adapters.push(
        await adapterFixtures[15].deploy(
            params[15][0],
            params[15][1],
            params[15][2],
            params[15][3],
            params[15][4],
            params[15][5],
            params[15][6]
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
