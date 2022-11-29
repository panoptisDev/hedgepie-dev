const hre = require("hardhat");
const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

describe("Pancakeswap Stake Adapter Integration Test", function () {
    before("Deploy contract", async function () {
        const [owner, alice, bob, tom] = await ethers.getSigners();

        const performanceFee = 50;
        const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        const cake = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
        const gal = "0xe4Cc45Bb5DBDA06dB6183E8bf016569f40497Aa5";
        const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.tom = tom;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.tomAddr = tom.address;

        this.strategy = "0xa5D57C5dca083a7051797920c78fb2b19564176B";
        this.stakingToken = cake;
        this.rewardToken = gal;

        // Deploy Venus Adapter contract
        const PksStakeAdapter = await ethers.getContractFactory(
            "PancakeStakeAdapter"
        );
        this.pksStakeAdapter = await PksStakeAdapter.deploy(
            this.strategy,
            this.stakingToken,
            this.rewardToken,
            "PKS-STAKE-GAL-ADAPTER"
        );
        await this.pksStakeAdapter.deployed();

        // Deploy YBNFT contract
        ybNftFactory = await ethers.getContractFactory("YBNFT");
        this.ybNft = await ybNftFactory.deploy();

        // Mint NFTs
        // tokenID: 1
        await this.ybNft.mint(
            [10000],
            [cake],
            [this.pksStakeAdapter.address],
            performanceFee,
            "test tokenURI1"
        );

        // tokenID: 2
        await this.ybNft.mint(
            [10000],
            [cake],
            [this.pksStakeAdapter.address],
            performanceFee,
            "test tokenURI2"
        );

        const Lib = await ethers.getContractFactory("HedgepieLibrary");
        const lib = await Lib.deploy();

        // Deploy Investor contract
        investorFactory = await ethers.getContractFactory("HedgepieInvestor", {
            libraries: { HedgepieLibrary: lib.address },
        });
        this.investor = await investorFactory.deploy(
            this.ybNft.address,
            swapRouter,
            wbnb
        );

        // Deploy Adaptor Manager contract
        adapterManagerFactory = await ethers.getContractFactory(
            "HedgepieAdapterManager"
        );
        this.adapterManager = await adapterManagerFactory.deploy();

        // Add Venus Adapter to AdapterManager
        await this.adapterManager.addAdapter(this.pksStakeAdapter.address);

        // Set adapter manager in investor
        await this.investor.setAdapterManager(this.adapterManager.address);

        // Set investor in adapter manager
        await this.adapterManager.setInvestor(this.investor.address);

        // Set investor in pksStakeAdapter
        await this.pksStakeAdapter.setInvestor(this.investor.address);

        await this.pksStakeAdapter.setPath(wbnb, this.stakingToken, [
            wbnb,
            this.stakingToken,
        ]);
        await this.pksStakeAdapter.setPath(this.stakingToken, wbnb, [
            this.stakingToken,
            wbnb,
        ]);

        await this.pksStakeAdapter.setPath(wbnb, this.rewardToken, [
            wbnb,
            this.rewardToken,
        ]);
        await this.pksStakeAdapter.setPath(this.rewardToken, wbnb, [
            this.rewardToken,
            wbnb,
        ]);

        console.log("YBNFT: ", this.ybNft.address);
        console.log("Investor: ", this.investor.address);
        console.log("PKSStakeAdapter: ", this.pksStakeAdapter.address);
        console.log("AdapterManager: ", this.adapterManager.address);
        console.log("Strategy: ", this.strategy);
        console.log("Owner: ", this.owner.address);

        this.CAKE = await ethers.getContractAt(
            "contracts/interfaces/IBEP20.sol:IBEP20",
            cake
        );
        this.GAL = await ethers.getContractAt(
            "contracts/interfaces/IBEP20.sol:IBEP20",
            gal
        );
        this.WBNB = await ethers.getContractAt(
            "contracts/interfaces/IBEP20.sol:IBEP20",
            wbnb
        );
    });

    describe("should set correct state variable", function () {
        it("(1)Check strategy address", async function () {
            expect(await this.pksStakeAdapter.strategy()).to.eq(this.strategy);
        });

        it("(2)Check owner wallet", async function () {
            expect(await this.pksStakeAdapter.owner()).to.eq(
                this.owner.address
            );
        });

        it("(3)Check AdapterManager address in Investor contract", async function () {
            expect(await this.investor.adapterManager()).to.eq(
                this.adapterManager.address
            );
        });

        it("(4)Check Investor address in AdapterManager contract", async function () {
            expect(await this.adapterManager.investor()).to.eq(
                this.investor.address
            );
        });

        it("(5)Check owner wallet", async function () {
            expect(await this.pksStakeAdapter.owner()).to.eq(
                this.owner.address
            );
        });

        it("(6)Check AdapterInfo of YBNFT", async function () {
            const response = await this.ybNft.getAdapterInfo(1);
            expect(response[0].allocation).to.eq(10000);
            expect(response[0].token.toLowerCase()).to.eq(
                this.stakingToken.toLowerCase()
            );
            expect(response[0].addr).to.eq(this.pksStakeAdapter.address);
        });
    });

    describe("depositBNB function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositBNB(
                        this.owner.address,
                        3,
                        depositAmount.toString(),
                        {
                            gasPrice: 21e9,
                            value: depositAmount,
                        }
                    )
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2)should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositBNB(
                    this.owner.address,
                    1,
                    depositAmount.toString(),
                    {
                        gasPrice: 21e9,
                        value: depositAmount,
                    }
                )
            ).to.be.revertedWith("Error: Amount can not be 0");
        });

        it("(3)deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor
                    .connect(this.alice)
                    .depositBNB(this.aliceAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositBNB")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            const aliceInfo = await this.investor.userInfo(
                this.aliceAddr,
                this.ybNft.address,
                1
            );
            const aliceDeposit = Number(aliceInfo) / Math.pow(10, 18);
            expect(aliceDeposit).to.eq(10);

            const aliceAdapterInfos = await this.investor.userAdapterInfos(
                this.aliceAddr,
                1,
                this.pksStakeAdapter.address
            );
            expect(BigNumber.from(aliceAdapterInfos.amount).gt(0)).to.eq(true);

            const adapterInfos = await this.investor.adapterInfos(
                1,
                this.pksStakeAdapter.address
            );
            expect(
                BigNumber.from(adapterInfos.totalStaked).sub(
                    BigNumber.from(aliceAdapterInfos.amount)
                )
            ).to.eq(0);

            const aliceWithdrable =
                await this.pksStakeAdapter.getWithdrawalAmount(
                    this.aliceAddr,
                    1
                );
            expect(BigNumber.from(aliceWithdrable)).to.eq(
                BigNumber.from(aliceAdapterInfos.amount)
            );
        });

        it("(4)deposit should success for Bob", async function () {
            const aliceAdapterInfos = await this.investor.userAdapterInfos(
                this.aliceAddr,
                1,
                this.pksStakeAdapter.address
            );
            const beforeAdapterInfos = await this.investor.adapterInfos(
                1,
                this.pksStakeAdapter.address
            );

            const depositAmount = ethers.utils.parseEther("20");
            await expect(
                this.investor
                    .connect(this.bob)
                    .depositBNB(this.bobAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositBNB")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            const bobInfo = await this.investor.userInfo(
                this.bobAddr,
                this.ybNft.address,
                1
            );
            const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
            expect(bobDeposit).to.eq(20);

            const bobAdapterInfos = await this.investor.userAdapterInfos(
                this.bobAddr,
                1,
                this.pksStakeAdapter.address
            );
            expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

            const afterAdapterInfos = await this.investor.adapterInfos(
                1,
                this.pksStakeAdapter.address
            );
            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).gt(
                    beforeAdapterInfos.totalStaked
                )
            ).to.eq(true);
            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).sub(
                    aliceAdapterInfos.amount
                )
            ).to.eq(BigNumber.from(bobAdapterInfos.amount));

            const bobWithdrable =
                await this.pksStakeAdapter.getWithdrawalAmount(this.bobAddr, 1);
            expect(BigNumber.from(bobWithdrable)).to.eq(
                BigNumber.from(bobAdapterInfos.amount)
            );
        }).timeout(50000000);

        it("(5)deposit should success for Tom", async function () {
            const beforeAdapterInfos = await this.investor.adapterInfos(
                1,
                this.pksStakeAdapter.address
            );

            const depositAmount = ethers.utils.parseEther("30");
            await expect(
                this.investor
                    .connect(this.tom)
                    .depositBNB(this.tomAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositBNB")
                .withArgs(this.tomAddr, this.ybNft.address, 1, depositAmount);

            const tomInfo = await this.investor.userInfo(
                this.tomAddr,
                this.ybNft.address,
                1
            );
            const tomDeposit = Number(tomInfo) / Math.pow(10, 18);
            expect(tomDeposit).to.eq(30);

            const tomAdapterInfos = await this.investor.userAdapterInfos(
                this.tomAddr,
                1,
                this.pksStakeAdapter.address
            );
            expect(BigNumber.from(tomAdapterInfos.amount).gt(0)).to.eq(true);

            const afterAdapterInfos = await this.investor.adapterInfos(
                1,
                this.pksStakeAdapter.address
            );
            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).gt(
                    beforeAdapterInfos.totalStaked
                )
            ).to.eq(true);
            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).sub(
                    tomAdapterInfos.amount
                )
            ).to.eq(BigNumber.from(beforeAdapterInfos.totalStaked));

            const tomWithdrable =
                await this.pksStakeAdapter.getWithdrawalAmount(this.tomAddr, 1);
            expect(BigNumber.from(tomWithdrable)).to.eq(
                BigNumber.from(tomAdapterInfos.amount)
            );
        }).timeout(50000000);
    });

    describe("withdrawBNB() function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {
            // withdraw to nftID: 3
            await expect(
                this.investor.withdrawBNB(this.owner.address, 3, {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2)should receive BNB successfully after withdraw function for Alice", async function () {
            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.aliceAddr);

            await expect(
                this.investor
                    .connect(this.alice)
                    .withdrawBNB(this.aliceAddr, 1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.aliceAddr);

            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
            ).to.eq(true);

            const aliceInfo = await this.investor.userInfo(
                this.aliceAddr,
                this.ybNft.address,
                1
            );
            expect(aliceInfo).to.eq(BigNumber.from(0));

            const aliceWithdrable =
                await this.pksStakeAdapter.getWithdrawalAmount(
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
            expect(bobDeposit).to.eq(20);

            const bobWithdrable =
                await this.pksStakeAdapter.getWithdrawalAmount(this.bobAddr, 1);
            expect(BigNumber.from(bobWithdrable).gt(0)).to.eq(true);
        }).timeout(50000000);

        it("(3)should receive BNB successfully after withdraw function for Bob", async function () {
            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.bobAddr);

            await expect(
                this.investor
                    .connect(this.bob)
                    .withdrawBNB(this.bobAddr, 1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.bobAddr);

            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
            ).to.eq(true);

            const bobInfo = await this.investor.userInfo(
                this.bobAddr,
                this.ybNft.address,
                1
            );
            expect(bobInfo).to.eq(BigNumber.from(0));

            const bobWithdrable =
                await this.pksStakeAdapter.getWithdrawalAmount(this.bobAddr, 1);
            expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(0));

            const tomInfo = await this.investor.userInfo(
                this.tomAddr,
                this.ybNft.address,
                1
            );
            const tomDeposit = Number(tomInfo) / Math.pow(10, 18);
            expect(tomDeposit).to.eq(30);

            const tomWithdrable =
                await this.pksStakeAdapter.getWithdrawalAmount(this.tomAddr, 1);
            expect(BigNumber.from(tomWithdrable).gt(0)).to.eq(true);
        }).timeout(50000000);

        it("(4)should receive BNB successfully after withdraw function for Tom", async function () {
            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.tomAddr);

            await expect(
                this.investor
                    .connect(this.tom)
                    .withdrawBNB(this.tomAddr, 1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.tomAddr);

            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
            ).to.eq(true);

            const tomInfo = await this.investor.userInfo(
                this.tomAddr,
                this.ybNft.address,
                1
            );
            expect(tomInfo).to.eq(BigNumber.from(0));

            const tomWithdrable =
                await this.pksStakeAdapter.getWithdrawalAmount(this.tomAddr, 1);
            expect(tomWithdrable).to.eq(0);
        }).timeout(50000000);
    });
});
