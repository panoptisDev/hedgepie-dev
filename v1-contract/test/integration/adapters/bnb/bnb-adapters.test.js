const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkBNBNetwork } = require("../../../shared/utilities");
const { adapterFixtureBsc } = require("../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("Global BNB Adapters Integration Test", function () {
    before("Deploy adapter contracts", async function () {
        await forkBNBNetwork();

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
            "HedgepieAdapterInfoBsc"
        );
        this.adapterInfo = await AdapterInfo.deploy();
        await this.adapterInfo.deployed();

        // Deploy Investor contract
        const InvestorFactory = await ethers.getContractFactory(
            "HedgepieInvestorBsc"
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
            "HedgepieAdapterManagerBsc"
        );
        this.adapterManager = await AdapterManager.deploy();
        await this.adapterManager.deployed();

        // Mint NFTs
        // tokenID: 1
        await this.ybNft.mint(
            new Array(10).fill(10000 / 10),
            stakingTokens.slice(0, 10),
            this.ethAdapters.slice(0, 10).map((it) => it.address),
            performanceFee,
            "test tokenURI1"
        );

        // tokenID: 2
        await this.ybNft.mint(
            new Array(8).fill(10000 / 8),
            stakingTokens.slice(10, 19),
            this.ethAdapters.slice(10, 19).map((it) => it.address),
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

    describe("depositBNB function test", function () {
        it("(1) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await this.investor
                .connect(this.alice)
                .depositBNB(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                });

            for (let i = 0; i < 10; i++) {
                const aliceInfo = (
                    await this.ethAdapters[i].userAdapterInfos(
                        this.aliceAddr,
                        1
                    )
                ).invested;
                expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(1);

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
            await this.investor.connect(this.bob).depositBNB(2, depositAmount, {
                gasPrice: 21e9,
                value: depositAmount,
            });

            for (let i = 10; i < 18; i++) {
                const bobInfo = (
                    await this.ethAdapters[i].userAdapterInfos(this.bobAddr, 2)
                ).invested;

                expect(Number(bobInfo) / Math.pow(10, 16)).to.eq(250);

                const bobAdapterInfos = await this.ethAdapters[
                    i
                ].userAdapterInfos(this.bobAddr, 2);

                const adapterInfos = await this.ethAdapters[i].adapterInfos(2);
                expect(BigNumber.from(adapterInfos.totalStaked)).to.gte(0);
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

    describe("withdrawBNB() function test", function () {
        it("(1) should receive the BNB successfully after withdraw function for Alice", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.aliceAddr);

            await expect(
                this.investor
                    .connect(this.alice)
                    .withdrawBNB(1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.aliceAddr);
            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
            ).to.eq(true);

            for (let i = 0; i < 10; i++) {
                aliceInfo = (
                    await this.ethAdapters[i].userAdapterInfos(
                        this.aliceAddr,
                        1
                    )
                ).invested;
                expect(aliceInfo).to.eq(BigNumber.from(0));
            }
        });

        it("(2) should receive the BNB successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.bobAddr);

            await expect(
                this.investor
                    .connect(this.bob)
                    .withdrawBNB(2, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
            ).to.eq(true);

            for (let i = 10; i < 18; i++) {
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
        // Alpaca::AUSD::USDT
        "0x158Da805682BdC8ee32d52833aD41E74bb951E59", // Strategy: USDT Vault
        "0x55d398326f99059fF775485246999027B3197955", // StakingToken: Binance-Peg BSC-USD (BSC-USD)
        "0x10ED43C718714eb63d5aA57B78B54704E256024E", // SwapRouter: PKS
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
        "Alpaca::AUSD::USDT",
        [
            [
                "0x55d398326f99059fF775485246999027B3197955",
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            ],
        ],
    ],
    [
        // Alpaca::Lend::BNB
        "0xd7D069493685A581d27824Fc46EdA46B7EfC0063",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Alpaca::Lend::BNB",
        [],
    ],
    [
        // Alpaca::Stake::ibCake
        28,
        "0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F",
        "0xfF693450dDa65df7DD6F45B4472655A986b147Eb",
        "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Alpaca::Stake::ibCake",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
            ],
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
            ],
        ],
    ],
    [
        // Apeswap::Banana Adapter
        "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
        "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
        "0x86Ef5e73EDB2Fea111909Fe35aFcC564572AcC06",
        "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
        "Apeswap::Banana Adapter",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
            ],
        ],
    ],
    [
        // Apeswap::Farm::BUSD-WBNB
        3,
        "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
        "0x51e6D27FA57373d8d4C256231241053a70Cb1d93",
        "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
        "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Apeswap::Farm::BUSD-WBNB",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            ],
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
            ],
        ],
    ],
    [
        // Apeswap::Jungle::SWT-BNB LP
        "0x6d986e76745fA4f99bAD44dd2792351bf2d0800F",
        "0xD2280ae010CE3e519a09a459E200bACD303eA330",
        "0xE8EbCf4Fd1faa9B77c0ec0B26e7Cc32a251Cd799",
        "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Apeswap::Jungle::SWT-BNB LP",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0xE8EbCf4Fd1faa9B77c0ec0B26e7Cc32a251Cd799",
            ],
        ],
    ],
    [
        // Apeswap::Vault::BNB-ETH LP
        5,
        "0x38f010F1005fC70239d6Bc2173896CA35D624e8d",
        "0x17884b90f18B8875147D02a8119a6226841d282e",
        "0xA0C3Ef24414ED9C9B456740128d8E63D016A9e11",
        "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
        "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Apeswap::Vault::BNB-ETH LP",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
            ],
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
            ],
        ],
    ],
    [
        // AutoFarm::Vault::WBNB-CAKE
        619,
        "0x0895196562C7868C5Be92459FaE7f877ED450452",
        "0xcFF7815e0e85a447b0C21C94D25434d1D0F718D1",
        "0x0ed7e52944161450477ee417de9cd3a859b14fd0",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "AutoFarm::Vault::WBNB-CAKE",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
            ],
        ],
    ],
    [
        // Beefy::Vault::Biswap USDT-BUSD
        "0x164fb78cAf2730eFD63380c2a645c32eBa1C52bc",
        "0xDA8ceb724A06819c0A5cDb4304ea0cB27F8304cF",
        "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Beefy::Vault::Biswap USDT-BUSD",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x55d398326f99059fF775485246999027B3197955",
            ],
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            ],
        ],
    ],
    [
        // Beefy::Vault::ETH
        "0x725E14C3106EBf4778e01eA974e492f909029aE8",
        "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
        "0x0000000000000000000000000000000000000000",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Beefy::Vault::ETH",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
            ],
        ],
    ],
    [
        // Belt::Vault::BNB
        "0x9171Bf7c050aC8B4cf7835e51F7b4841DFB2cCD0",
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        "0x9171Bf7c050aC8B4cf7835e51F7b4841DFB2cCD0",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Belt::Vault::BNB",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            ],
        ],
    ],
    [
        // Biswap::Farm::USDT-BSW
        0,
        "0xDbc1A13490deeF9c3C12b44FE77b503c1B061739",
        "0x965f527d9159dce6288a2219db51fc6eef120dd1",
        "0x965f527d9159dce6288a2219db51fc6eef120dd1",
        "0x0000000000000000000000000000000000000000",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Biswap::Farm::USDT-BSW",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x55d398326f99059ff775485246999027b3197955",
            ],
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x965f527d9159dce6288a2219db51fc6eef120dd1",
            ],
        ],
    ],
    [
        // Biswap::Farm::USD-WBNB
        9,
        "0xDbc1A13490deeF9c3C12b44FE77b503c1B061739",
        "0x2b30c317ceDFb554Ec525F85E79538D59970BEb0",
        "0x965f527d9159dce6288a2219db51fc6eef120dd1",
        "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Biswap::Farm::USD-WBNB",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x55d398326f99059ff775485246999027b3197955",
            ],
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x965f527d9159dce6288a2219db51fc6eef120dd1",
            ],
        ],
    ],
    [
        // PancakeSwap::Farm::CAKE-WBNB
        2,
        "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652",
        "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0",
        "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "PancakeSwap::Farm::CAKE-WBNB",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
            ],
        ],
    ],
    [
        // PK::STAKE::XCAD-ADAPTER
        "0x68Cc90351a79A4c10078FE021bE430b7a12aaA09",
        "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "0x431e0cD023a32532BF3969CddFc002c00E98429d",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "PK::STAKE::XCAD-ADAPTER",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
            ],
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0x431e0cD023a32532BF3969CddFc002c00E98429d",
                "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            ],
        ],
    ],
    [
        // Venus::BUSD::Lend
        "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "Venus::BUSD::Lend",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            ],
        ],
    ],
    [
        // Venus::BUSD Long Leverage Adapter
        "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        4,
        "Venus::BUSD Long Leverage Adapter",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            ],
        ],
    ],
    [
        // Venus::BUSD Short Leverage Adapter
        "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
        "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        4,
        "Venus::BUSD Short Leverage Adapter",
        [
            [
                "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            ],
        ],
    ],
];

const stakingTokens = [
    "0x55d398326f99059fF775485246999027B3197955",
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    "0xfF693450dDa65df7DD6F45B4472655A986b147Eb",
    "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
    "0x51e6D27FA57373d8d4C256231241053a70Cb1d93",
    "0xD2280ae010CE3e519a09a459E200bACD303eA330",
    "0xA0C3Ef24414ED9C9B456740128d8E63D016A9e11",
    "0x0ed7e52944161450477ee417de9cd3a859b14fd0",
    "0xDA8ceb724A06819c0A5cDb4304ea0cB27F8304cF",
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    "0x2b30c317ceDFb554Ec525F85E79538D59970BEb0",
    "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0",
    "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
];

const deployAdapters = async () => {
    let adapters = [];
    let adapterFixtures = [];

    // Get Adapter Fixtures
    adapterFixtures.push(await adapterFixtureBsc("AlpacaAUSDAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("AlpacaLendAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("AlpacaStakeAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("ApeswapBananaAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("ApeswapFarmLPAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("ApeswapJungleAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("ApeswapVaultAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("AutoVaultAdapterBsc"));
    adapterFixtures.push(await adapterFixtureBsc("BeefyVaultAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("BeefyVaultAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("BeltVaultAdapter"));
    adapterFixtures.push(await adapterFixtureBsc("BiSwapFarmLPAdapterBsc"));
    adapterFixtures.push(await adapterFixtureBsc("BiSwapFarmLPAdapterBsc"));
    adapterFixtures.push(
        await adapterFixtureBsc("PancakeSwapFarmLPAdapterBsc")
    );
    adapterFixtures.push(await adapterFixtureBsc("PancakeStakeAdapterBsc"));
    adapterFixtures.push(await adapterFixtureBsc("VenusLendAdapterBsc"));
    adapterFixtures.push(await adapterFixtureBsc("VenusLevAdapterBsc"));
    adapterFixtures.push(await adapterFixtureBsc("VenusLevAdapterBsc"));

    // Deploy Adapters
    adapters.push(
        await adapterFixtures[0].deploy(
            params[0][0],
            params[0][1],
            params[0][2],
            params[0][3],
            params[0][4]
        )
    );
    adapters.push(
        await adapterFixtures[1].deploy(
            params[1][0],
            params[1][1],
            params[1][2],
            params[1][3],
            params[1][4]
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
            params[3][5]
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
            params[4][6]
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
            params[8][5]
        )
    );
    adapters.push(
        await adapterFixtures[9].deploy(
            params[9][0],
            params[9][1],
            params[9][2],
            params[9][3],
            params[9][4],
            params[9][5]
        )
    );
    adapters.push(
        await adapterFixtures[10].deploy(
            params[10][0],
            params[10][1],
            params[10][2],
            params[10][3],
            params[10][4],
            params[10][5]
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
            params[11][7]
        )
    );
    adapters.push(
        await adapterFixtures[12].deploy(
            params[12][0],
            params[12][1],
            params[12][2],
            params[12][3],
            params[12][4],
            params[12][5],
            params[12][6],
            params[12][7]
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
            params[13][6]
        )
    );
    adapters.push(
        await adapterFixtures[14].deploy(
            params[14][0],
            params[14][1],
            params[14][2],
            params[14][3],
            params[14][4],
            params[14][5]
        )
    );
    adapters.push(
        await adapterFixtures[15].deploy(
            params[15][0],
            params[15][1],
            params[15][2],
            params[15][3],
            params[15][4],
            params[15][5]
        )
    );

    adapters.push(
        await adapterFixtures[16].deploy(
            params[16][0],
            params[16][1],
            params[16][2],
            params[16][3],
            params[16][4]
        )
    );
    adapters.push(
        await adapterFixtures[17].deploy(
            params[17][0],
            params[17][1],
            params[17][2],
            params[17][3],
            params[17][4]
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
