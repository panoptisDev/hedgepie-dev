const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setPath, forkPolygonNetwork } = require("../../../../shared/utilities");
const {
    adapterFixtureMatic,
    investorFixtureMatic,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("StargateFarmAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        await forkPolygonNetwork();

        const [owner, alice, bob, tom, treasury] = await ethers.getSigners();

        const performanceFee = 50;
        const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
        const strategy = "0x8731d54E9D02c286767d56ac03e8037C07e01e98"; // LPStaking contract
        const stakingToken = "0x1205f31718499dBf1fCa446663B532Ef87481fe1"; // S*USDC
        const rewardToken = "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590"; // STG token
        // const swapRouter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; // quickswap router address
        const swapRouter = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"; // sushiswap router address
        const lpProvider = "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd"; // Stargate Router

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.tom = tom;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.tomAddr = tom.address;

        this.accTokenPerShare = BigNumber.from(0);

        // Deploy StargateFarmAdapterMatic Adapter contract
        const StargateFarmAdapterMatic = await adapterFixtureMatic(
            "StargateFarmAdapterMatic"
        );
        this.adapter = await StargateFarmAdapterMatic.deploy(
            strategy,
            [stakingToken, USDC],
            rewardToken,
            swapRouter,
            lpProvider,
            [0, 1],
            wmatic,
            "Stargate::USDC::LPAdapter"
        );
        await this.adapter.deployed();

        [this.adapterInfo, this.investor, this.ybNft] =
            await investorFixtureMatic(
                this.adapter,
                treasury.address,
                stakingToken,
                performanceFee
            );

        await setPath(this.adapter, wmatic, USDC);
        await setPath(this.adapter, wmatic, rewardToken);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("UniswapLPAdapter: ", this.adapter.address);
    });

    describe("depositMATIC function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositMATIC(3, depositAmount.toString(), {
                        value: depositAmount,
                    })
            ).to.be.revertedWith("nft tokenId is invalid");
        });

        it("(2) should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositMATIC(1, depositAmount.toString(), {
                    value: depositAmount,
                })
            ).to.be.revertedWith("Error: Insufficient MATIC");
        });

        it("(3) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("100");
            await expect(
                this.investor
                    .connect(this.alice)
                    .depositMATIC(1, depositAmount, {
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            const aliceInfo = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            const aliceDeposit = Number(aliceInfo.invested) / Math.pow(10, 18);
            expect(aliceDeposit).to.eq(100);
            expect(BigNumber.from(aliceInfo.amount).gt(0)).to.eq(true);

            const adapterInfos = await this.adapter.adapterInfos(1);
            expect(
                BigNumber.from(adapterInfos.totalStaked).sub(
                    BigNumber.from(aliceInfo.amount)
                )
            ).to.eq(0);

            // Check accTokenPerShare Info
            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare;
            expect(BigNumber.from(this.accTokenPerShare)).to.eq(
                BigNumber.from(0)
            );
        });

        it("(4) deposit should success for Bob", async function () {
            const aliceAdapterInfos = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            const beforeAdapterInfos = await this.adapter.adapterInfos(1);

            const depositAmount = ethers.utils.parseEther("200");
            await expect(
                this.investor.connect(this.bob).depositMATIC(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            const bobInfo = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            const bobDeposit = Number(bobInfo.invested) / Math.pow(10, 18);
            expect(bobDeposit).to.eq(200);
            expect(BigNumber.from(bobInfo.amount).gt(0)).to.eq(true);

            const afterAdapterInfos = await this.adapter.adapterInfos(1);
            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).gt(
                    beforeAdapterInfos.totalStaked
                )
            ).to.eq(true);

            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).sub(
                    aliceAdapterInfos.amount
                )
            ).to.eq(BigNumber.from(bobInfo.amount));

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

        it("(5) deposit should success for Tom", async function () {
            // wait 40 mins
            for (let i = 0; i < 7200; i++) {
                await ethers.provider.send("evm_mine", []);
            }

            const beforeAdapterInfos = await this.adapter.adapterInfos(1);

            const depositAmount = ethers.utils.parseEther("30");
            await expect(
                this.investor.connect(this.tom).depositMATIC(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.tomAddr, this.ybNft.address, 1, depositAmount);

            const tomInfo = await this.adapter.userAdapterInfos(
                this.tomAddr,
                1
            );
            const tomDeposit = Number(tomInfo.invested) / Math.pow(10, 18);
            expect(tomDeposit).to.eq(30);
            expect(BigNumber.from(tomInfo.amount).gt(0)).to.eq(true);

            const afterAdapterInfos = await this.adapter.adapterInfos(1);
            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).gt(
                    beforeAdapterInfos.totalStaked
                )
            ).to.eq(true);
            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).sub(
                    tomInfo.amount
                )
            ).to.eq(BigNumber.from(beforeAdapterInfos.totalStaked));

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

        it("(6) test claim, pendingReward function", async function () {
            const beforeMATIC = await ethers.provider.getBalance(
                this.aliceAddr
            );
            const pending = await this.adapter.pendingReward(1, this.aliceAddr);

            await this.investor.connect(this.alice).claim(1);
            const gasPrice = await ethers.provider.getGasPrice();
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.claim(1);

            const afterMATIC = await ethers.provider.getBalance(this.aliceAddr);
            const actualPending = afterMATIC
                .sub(beforeMATIC)
                .add(gas.mul(gasPrice));

            expect(pending).to.be.within(
                actualPending,
                actualPending.add(BigNumber.from(2e14))
            );
        });

        it("(7) test TVL & participants", async function () {
            const nftInfo = await this.adapterInfo.adapterInfo(1);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo.tvl).toString()
                    )
                )
            ).to.be.eq(330) &&
                expect(BigNumber.from(nftInfo.participant).toString()).to.be.eq(
                    "3"
                );
        });
    });

    describe("withdrawMATIC() function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // withdraw to nftID: 3
            await expect(this.investor.withdrawMATIC(3)).to.be.revertedWith(
                "nft tokenId is invalid"
            );
        });

        it("(2) should receive MATIC successfully after withdraw function for Alice", async function () {
            // withdraw from nftId: 1
            const beforeMATIC = await ethers.provider.getBalance(
                this.aliceAddr
            );

            await expect(
                this.investor.connect(this.alice).withdrawMATIC(1)
            ).to.emit(this.investor, "WithdrawMATIC");

            const afterMATIC = await ethers.provider.getBalance(this.aliceAddr);

            expect(
                BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))
            ).to.eq(true);

            const aliceInfo = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            expect(aliceInfo.invested).to.eq(BigNumber.from(0));

            const bobInfo = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            const bobDeposit = Number(bobInfo.invested) / Math.pow(10, 18);
            expect(bobDeposit).to.eq(200);
        });

        it("(3) should receive MATIC successfully after withdraw function for Bob", async function () {
            // withdraw from nftId: 1
            const beforeMATIC = await ethers.provider.getBalance(this.bobAddr);

            await expect(
                this.investor.connect(this.bob).withdrawMATIC(1)
            ).to.emit(this.investor, "WithdrawMATIC");

            const afterMATIC = await ethers.provider.getBalance(this.bobAddr);

            expect(
                BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))
            ).to.eq(true);

            const bobInfo = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(bobInfo.invested).to.eq(BigNumber.from(0));

            const tomInfo = await this.adapter.userAdapterInfos(
                this.tomAddr,
                1
            );
            const tomDeposit = Number(tomInfo.invested) / Math.pow(10, 18);
            expect(tomDeposit).to.eq(30);

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

        it("(4) should receive MATIC successfully after withdraw function for Tom", async function () {
            // withdraw from nftId: 1
            const beforeMATIC = await ethers.provider.getBalance(this.tomAddr);

            await expect(
                this.investor.connect(this.tom).withdrawMATIC(1)
            ).to.emit(this.investor, "WithdrawMATIC");

            const afterMATIC = await ethers.provider.getBalance(this.tomAddr);

            expect(
                BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))
            ).to.eq(true);

            const tomInfo = await this.adapter.userAdapterInfos(
                this.tomAddr,
                1
            );
            expect(tomInfo.invested).to.eq(BigNumber.from(0));

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
    });
});
