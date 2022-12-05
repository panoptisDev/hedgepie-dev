const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkPolygonNetwork } = require("../../../../shared/utilities");
const {
    adapterFixtureMatic,
    investorFixtureMatic,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("UniswapLPAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        await forkPolygonNetwork();

        const [owner, alice, bob, tom, treasury] = await ethers.getSigners();

        const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
        const strategy = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"; // NonfungiblePositionManager
        const stakingToken = "0xA374094527e1673A86dE625aa59517c5dE346d32"; // USDC-WMATIC Uniswap v3 pool
        const swapRouter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; // quickswap rounter address

        this.performanceFee = 50;
        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.tom = tom;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.tomAddr = tom.address;
        this.treasuryAddr = treasury.address;

        this.lower = -500000;
        this.upper = -300000;

        this.accTokenPerShare = BigNumber.from(0);

        // Deploy Uniswap LP Adapter contract
        const uniswapV3LpAdapter = await adapterFixtureMatic(
            "UniswapLPAdapter"
        );
        this.aAdapter = await uniswapV3LpAdapter.deploy(
            strategy,
            stakingToken,
            swapRouter,
            wmatic,
            this.lower,
            this.upper,
            "Uniswap::USDC-WMATIC::LPAdapter"
        );
        await this.aAdapter.deployed();

        [this.adapterInfo, this.investor, this.ybNft] =
            await investorFixtureMatic(
                this.aAdapter,
                treasury.address,
                stakingToken,
                this.performanceFee
            );

        await setPath(this.aAdapter, wmatic, USDC);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("UniswapLPAdapter: ", this.aAdapter.address);
    });

    describe("depositMATIC function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {
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

        it("(2)should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositMATIC(1, depositAmount)
            ).to.be.revertedWith("Error: Insufficient MATIC");
        });

        it("(3)deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            const beforeMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            await expect(
                this.investor.connect(this.alice).depositMATIC(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            // compare user info
            const aliceInfo = await this.aAdapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            expect(aliceInfo.invested).to.lte(depositAmount);
            expect(aliceInfo.amount).to.be.gt(0);

            // compare adapter info
            const adapterInfos = await this.aAdapter.adapterInfos(1);
            expect(adapterInfos.totalStaked).to.eq(aliceInfo.amount);

            // compare Matic in adapter contract
            const afterMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            expect(afterMATIC).to.eq(beforeMATIC);
        });

        it("(4)deposit should success for Bob", async function () {
            const adapterInfoBefore = await this.aAdapter.adapterInfos(1);
            const beforeMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            const depositAmount = ethers.utils.parseEther("10");
            await this.investor.connect(this.bob).depositMATIC(1, depositAmount, {
                value: depositAmount,
            });
            await this.investor.connect(this.bob).depositMATIC(1, depositAmount, {
                value: depositAmount,
            });

            // compare user info
            const bobInfo = await this.aAdapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(bobInfo.invested).to.lte(ethers.utils.parseEther("20"));
            expect(bobInfo.amount).to.be.gt(0);

            // compare adapter info
            const adapterInfoAfter = await this.aAdapter.adapterInfos(1);
            expect(adapterInfoAfter.totalStaked).to.be.gt(
                adapterInfoBefore.totalStaked
            );

            // compare Matic in adapter contract
            const afterMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            expect(afterMATIC).to.eq(beforeMATIC);
        }).timeout(50000000);

        it("(5)deposit should success for Tom", async function () {
            const adapterInfoBefore = await this.aAdapter.adapterInfos(1);
            const beforeMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            const depositAmount = ethers.utils.parseEther("30");
            await this.investor.connect(this.tom).depositMATIC(1, depositAmount, {
                value: depositAmount,
            });

            // compare user info
            const tomInfo = await this.aAdapter.userAdapterInfos(
                this.tomAddr,
                1
            );
            expect(tomInfo.invested).to.lte(depositAmount);
            expect(tomInfo.amount).to.be.gt(0);

            // compare adapter info
            const adapterInfoAfter = await this.aAdapter.adapterInfos(1);
            expect(adapterInfoAfter.totalStaked).to.be.gt(
                adapterInfoBefore.totalStaked
            );

            // compare Matic in adapter contract
            const afterMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            expect(afterMATIC).to.eq(beforeMATIC);
        }).timeout(50000000);

        it("(6)test TVL & participants", async function () {
            const nftInfo = await this.adapterInfo.adapterInfo(1);
            expect(nftInfo.tvl).to.be.lte(ethers.utils.parseEther("60"));
            expect(nftInfo.participant).to.be.eq("3");
        });
    });

    describe("withdrawMATIC function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {
            // withdraw to nftID: 3
            await expect(this.investor.withdrawMATIC(3)).to.be.revertedWith(
                "Error: nft tokenId is invalid"
            );
        });

        it("(2)should receive Matic successfully after withdraw function for Alice", async function () {
            const maticBalBefore = await ethers.provider.getBalance(
                this.aliceAddr
            );
            const beforeMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            const beforeOwnerMATIC = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            const aliceInfo = (
                await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.withdrawMATIC(1, { gasPrice });
            await expect(
                this.investor.connect(this.alice).withdrawMATIC(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawMATIC");

            // compare user info
            const maticBalAfter = await ethers.provider.getBalance(
                this.aliceAddr
            );
            expect(maticBalAfter).to.gt(maticBalBefore);

            // check protocol fee
            const rewardAmt = maticBalAfter.sub(maticBalBefore);
            const afterOwnerMATIC = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(aliceInfo)) {
                actualPending = actualPending.sub(BigNumber.from(aliceInfo));
                const protocolFee = afterOwnerMATIC.sub(beforeOwnerMATIC);
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

            // compare adapter info
            const aliceAdapterInfo = await this.aAdapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            expect(aliceAdapterInfo.invested).to.eq("0");

            // compare Matic in adapter contract
            const afterMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            expect(afterMATIC).to.eq(beforeMATIC);
        }).timeout(50000000);

        it("(3)should receive Matic successfully after withdraw function for Bob", async function () {
            const maticBalBefore = await ethers.provider.getBalance(this.bobAddr);
            const beforeMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            const beforeOwnerMATIC = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            const bobInfo = (
                await this.aAdapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.bob)
                .estimateGas.withdrawMATIC(1, { gasPrice });
            await expect(
                this.investor.connect(this.bob).withdrawMATIC(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawMATIC");
            const maticBalAfter = await ethers.provider.getBalance(this.bobAddr);
            expect(maticBalAfter).to.gt(maticBalBefore);

            // check protocol fee
            const rewardAmt = maticBalAfter.sub(maticBalBefore);
            const afterOwnerMATIC = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(bobInfo)) {
                actualPending = actualPending.sub(BigNumber.from(bobInfo));
                const protocolFee = afterOwnerMATIC.sub(beforeOwnerMATIC);
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

            // compare adapter info
            const bobAdapterInfo = await this.aAdapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(bobAdapterInfo.invested).to.eq("0");

            // compare Matic in adapter contract
            const afterMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            expect(afterMATIC).to.eq(beforeMATIC);
        }).timeout(50000000);

        it("(4)should receive Matic successfully after withdraw function for Tom", async function () {
            const maticBalBefore = await ethers.provider.getBalance(this.tomAddr);
            const beforeMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            const beforeOwnerMATIC = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            const tomInfo = (
                await this.aAdapter.userAdapterInfos(this.tomAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.tom)
                .estimateGas.withdrawMATIC(1, { gasPrice });
            await expect(
                this.investor.connect(this.tom).withdrawMATIC(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawMATIC");

            const maticBalAfter = await ethers.provider.getBalance(this.tomAddr);
            expect(maticBalAfter).to.gt(maticBalBefore);

            // check protocol fee
            const rewardAmt = maticBalAfter.sub(maticBalBefore);
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(tomInfo)) {
                actualPending = actualPending - tomInfo;
                const afterOwnerMATIC = await ethers.provider.getBalance(
                    this.treasuryAddr
                );
                const protocolFee = afterOwnerMATIC.sub(beforeOwnerMATIC);
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

            // compare adapter info
            const tomAdapterInfo = await this.aAdapter.userAdapterInfos(
                this.tomAddr,
                1
            );
            expect(tomAdapterInfo.invested).to.eq("0");

            // compare Matic in adapter contract
            const afterMATIC = await ethers.provider.getBalance(
                this.aAdapter.address
            );
            expect(afterMATIC).to.eq(beforeMATIC);
        }).timeout(50000000);
    });
});
