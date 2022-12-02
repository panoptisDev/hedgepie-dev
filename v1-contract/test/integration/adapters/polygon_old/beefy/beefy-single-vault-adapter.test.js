const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkPolygonNetwork } = require("../../../../shared/utilities");
const {
    adapterFixtureMatic,
    investorFixtureMatic,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("BeefySingleVaultAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        await forkPolygonNetwork();

        const [owner, alice, bob, treasury] = await ethers.getSigners();

        const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        const strategy = "0x1A723371f9dc30653dafd826B60d9335bf867E35"; // Beefy QUICK token Vault
        const stakingToken = "0xB5C064F955D8e7F38fE0460C556a72987494eE17"; // QUICK token
        const swapRouter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; // quickswap router address

        this.performanceFee = 50;
        this.owner = owner;
        this.alice = alice;
        this.bob = bob;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.treasuryAddr = treasury.address;

        // Deploy BeefySingleVault Adapter contract
        const BeefyAdapter = await adapterFixtureMatic(
            "BeefyVaultAdapterMatic"
        );
        this.aAdapter = await BeefyAdapter.deploy(
            strategy,
            stakingToken,
            swapRouter,
            wmatic,
            "PolygonBeefy::QUICK::Vault"
        );
        await this.aAdapter.deployed();

        [this.adapterInfo, this.investor, this.ybNft] =
            await investorFixtureMatic(
                this.aAdapter,
                treasury.address,
                stakingToken,
                this.performanceFee
            );

        await setPath(this.aAdapter, wmatic, stakingToken);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("BeefySingleVaultAdapter: ", this.aAdapter.address);
    });

    describe("depositMatic function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositMatic(3, depositAmount.toString(), {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositMatic(1, depositAmount.toString(), {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("Error: Insufficient Matic");
        });

        it("(3)deposit should success for Alice", async function () {
            const beforeRepay = await this.repayToken.balanceOf(
                this.aAdapter.address
            );
            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor.connect(this.alice).depositMatic(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "depositMatic")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            const aliceAdapterInfos = await this.aAdapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            expect(BigNumber.from(aliceAdapterInfos.amount).gt(0)).to.eq(true);

            const adapterInfos = await this.aAdapter.adapterInfos(1);
            expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                BigNumber.from(aliceAdapterInfos.amount)
            );

            const afterRepay = await this.repayToken.balanceOf(
                this.aAdapter.address
            );
            expect(BigNumber.from(aliceAdapterInfos.userShares)).to.eq(
                BigNumber.from(afterRepay).sub(BigNumber.from(beforeRepay))
            );
        });

        it("(4)deposit should success for Bob", async function () {
            const beforeRepay = await this.repayToken.balanceOf(
                this.aAdapter.address
            );
            const aliceAdapterInfos = await this.aAdapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            const beforeAdapterInfos = await this.aAdapter.adapterInfos(1);

            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor.connect(this.bob).depositMatic(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "depositMatic")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            await expect(
                this.investor.connect(this.bob).depositMatic(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "depositMatic")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            const bobAdapterInfos = await this.aAdapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

            const afterAdapterInfos = await this.aAdapter.adapterInfos(1);
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

            const afterRepay = await this.repayToken.balanceOf(
                this.aAdapter.address
            );
            expect(BigNumber.from(bobAdapterInfos.userShares)).to.eq(
                BigNumber.from(afterRepay).sub(BigNumber.from(beforeRepay))
            );
        }).timeout(50000000);

        it("(5) test TVL & participants", async function () {
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

            const pendingInfo = await this.aAdapter.pendingReward(
                1,
                this.alice.address
            );
            expect(pendingInfo).to.gte(0);
        });
    });

    describe("withdrawMatic() function test", function () {
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
                    .withdrawMatic(3, { gasPrice: 21e9 })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should receive the Matic successfully after withdraw function for Alice", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeMatic = await ethers.provider.getBalance(this.aliceAddr);
            const beforeOwnerMatic = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let aliceInfo = (
                await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.withdrawMatic(1, { gasPrice });
            await expect(
                this.investor.connect(this.alice).withdrawMatic(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawMatic");

            const afterMatic = await ethers.provider.getBalance(this.aliceAddr);
            expect(
                BigNumber.from(afterMatic).gt(BigNumber.from(beforeMatic))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterMatic.sub(beforeMatic);
            const afterOwnerMatic = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(aliceInfo)) {
                actualPending = actualPending.sub(BigNumber.from(aliceInfo));
                const protocolFee = afterOwnerMatic.sub(beforeOwnerMatic);
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

            aliceInfo = (
                await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;
            expect(aliceInfo).to.eq(BigNumber.from(0));

            const bobInfo = (
                await this.aAdapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;
            const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
            expect(bobDeposit).to.eq(20);
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

        it("(4) should receive the Matic successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);
            // withdraw from nftId: 1
            const beforeMatic = await ethers.provider.getBalance(this.bobAddr);
            const beforeOwnerMatic = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let bobInfo = (
                await this.aAdapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.bob)
                .estimateGas.withdrawMatic(1, { gasPrice });
            await expect(
                this.investor.connect(this.bob).withdrawMatic(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawMatic");

            const afterMatic = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterMatic).gt(BigNumber.from(beforeMatic))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterMatic.sub(beforeMatic);
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(bobInfo)) {
                actualPending = actualPending - bobInfo;
                const afterOwnerMatic = await ethers.provider.getBalance(
                    this.treasuryAddr
                );
                const protocolFee = afterOwnerMatic.sub(beforeOwnerMatic);
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

            bobInfo = (await this.aAdapter.userAdapterInfos(this.bobAddr, 1))
                .invested;
            expect(bobInfo).to.eq(BigNumber.from(0));
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
