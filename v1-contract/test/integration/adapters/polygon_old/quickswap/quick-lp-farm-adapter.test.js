const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkPolygonNetwork } = require("../../../../shared/utilities");
const {
    adapterFixtureMatic,
    investorFixtureMatic,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("QuickLPFarmAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        await forkPolygonNetwork();

        const [owner, alice, bob, treasury] = await ethers.getSigners();

        const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        const strategy = "0x1098d71eCD0233929DA8a10579E96cBbbe78f7C2"; // USDC-ASTRAFER LP Farm
        const stakingToken = "0x01eBD3e57f4af47B7E96240e2B7B2227C902614A"; // USDC-ASTRAFER LP
        const rewardToken = "0xf28164A485B0B2C90639E47b0f377b4a438a16B1"; // Quick token
        const swapRouter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"; // quickswap router address
        const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
        const ASTRAFER = "0xDfCe1e99A31C4597a3f8A8945cBfa9037655e335";

        this.performanceFee = 50;
        this.owner = owner;
        this.alice = alice;
        this.bob = bob;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.treasuryAddr = treasury.address;

        this.accTokenPerShare = BigNumber.from(0);

        // Deploy Quick LPFarm Adapter contract
        const QuickAdapter = await adapterFixtureMatic(
            "QuickLPFarmAdapter"
        );
        this.aAdapter = await QuickAdapter.deploy(
            strategy,
            stakingToken,
            rewardToken,
            swapRouter,
            wmatic,
            "Quickswap::USDC-ASTRAFER::LP-Farm"
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
        await setPath(this.aAdapter, wmatic, ASTRAFER);
        await setPath(this.aAdapter, wmatic, rewardToken);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("QuickLPFarmAdapter: ", this.aAdapter.address);
    });

    describe("depositMATIC function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositMATIC(3, depositAmount.toString(), {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositMATIC(1, depositAmount.toString(), {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("Error: Insufficient MATIC");
        });

        it("(3) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor.connect(this.alice).depositMATIC(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            const aliceInfo = (
                await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;
            expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(10);

            const aliceAdapterInfos = await this.aAdapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            const adapterInfos = await this.aAdapter.adapterInfos(1);
            expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                BigNumber.from(aliceAdapterInfos.amount)
            );

            // Check accTokenPerShare Info
            this.accTokenPerShare = (
                await this.aAdapter.adapterInfos(1)
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

            const beforeAdapterInfos = await this.aAdapter.adapterInfos(1);
            const depositAmount = ethers.utils.parseEther("10");

            await expect(
                this.investor.connect(this.bob).depositMATIC(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            await expect(
                this.investor.connect(this.bob).depositMATIC(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            const bobInfo = (
                await this.aAdapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;
            expect(Number(bobInfo) / Math.pow(10, 18)).to.eq(20);

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

            // Check accTokenPerShare Info
            expect(
                BigNumber.from(
                    (await this.aAdapter.adapterInfos(1)).accTokenPerShare
                ).gte(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.aAdapter.adapterInfos(1)
            ).accTokenPerShare;
        });

        it("(5) test claim, pendingReward function and protocol-fee", async function () {
            const beforeMatic = await ethers.provider.getBalance(this.aliceAddr);
            const beforeMaticOwner = await ethers.provider.getBalance(
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
            await this.investor.connect(this.alice).claim(1, {
                gasPrice
            });

            const afterMatic = await ethers.provider.getBalance(this.aliceAddr);
            const protocolFee = (
                await ethers.provider.getBalance(this.treasuryAddr)
            ).sub(beforeMaticOwner);
            const actualPending = afterMatic
                .sub(beforeMatic)
                .add(gas.mul(gasPrice));

            expect(pending).to.be.within(
                actualPending.sub(BigNumber.from(2e14)),
                actualPending.add(BigNumber.from(2e14))
            )

            expect(protocolFee).to.be.within(
                actualPending
                    .mul(this.performanceFee)
                    .div(1e4)
                    .sub(BigNumber.from(2e14)),
                actualPending
                    .mul(this.performanceFee)
                    .div(1e4)
                    .add(BigNumber.from(2e14))
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

    describe("withdrawMATIC() function test", function () {
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
                    .withdrawMATIC(3, { gasPrice: 21e9 })
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
                .estimateGas.withdrawMATIC(1, { gasPrice });
            await expect(
                this.investor.connect(this.alice).withdrawMATIC(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawMATIC");

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

            expect(
                BigNumber.from(
                    (await this.aAdapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.aAdapter.adapterInfos(1)
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
                .estimateGas.withdrawMATIC(1, { gasPrice });
            await expect(
                this.investor.connect(this.bob).withdrawMATIC(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawMATIC");

            const afterMatic = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterMatic).gt(BigNumber.from(beforeMatic))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterMatic.sub(beforeMatic);
            const afterOwnerMatic = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(bobInfo)) {
                actualPending = actualPending.sub(BigNumber.from(bobInfo));
                const protocolFee = afterOwnerMatic.sub(beforeOwnerMatic);
                expect(protocolFee).to.gt(0);
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
