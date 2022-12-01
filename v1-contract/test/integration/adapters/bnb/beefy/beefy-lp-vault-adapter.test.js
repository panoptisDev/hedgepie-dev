const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath } = require("../../../../shared/utilities");
const {
    adapterFixtureBsc,
    investorFixtureBsc,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("BeefyLPVaultAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        const [owner, alice, bob, treasury] = await ethers.getSigners();

        const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        const stakingToken = "0xDA8ceb724A06819c0A5cDb4304ea0cB27F8304cF"; // Biswap USDT-BUSD LP
        const strategy = "0x164fb78cAf2730eFD63380c2a645c32eBa1C52bc"; // Moo BiSwap USDT-BUSD
        const routerAddr = "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8"; // Biswap router
        const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address
        const USDT = "0x55d398326f99059fF775485246999027B3197955";
        const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.performanceFee = 50;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.treasuryAddr = treasury.address;

        // Deploy Beefy LP Vault Adapter contract
        const beefyAdapter = await adapterFixtureBsc("BeefyVaultAdapter");
        this.aAdapter = await beefyAdapter.deploy(
            strategy,
            stakingToken,
            routerAddr,
            swapRouter,
            wbnb,
            "Beefy::Vault::Biswap USDT-BUSD"
        );
        await this.aAdapter.deployed();

        [this.adapterInfo, this.investor, this.ybNft] =
            await investorFixtureBsc(
                this.aAdapter,
                treasury.address,
                stakingToken,
                this.performanceFee
            );
            
        await setPath(this.aAdapter, wbnb, USDT);
        await setPath(this.aAdapter, wbnb, BUSD);

        this.repayToken = await ethers.getContractAt("IBEP20", strategy);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("BeefyLPVaultAdapter: ", this.aAdapter.address);
    });

    describe("depositBNB function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositBNB(3, depositAmount.toString(), {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositBNB(1, depositAmount.toString(), {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("Error: Insufficient BNB");
        });

        it("(3)deposit should success for Alice", async function () {
            const beforeRepay = await this.repayToken.balanceOf(
                this.aAdapter.address
            );
            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor.connect(this.alice).depositBNB(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositBNB")
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
                this.investor.connect(this.bob).depositBNB(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositBNB")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            await expect(
                this.investor.connect(this.bob).depositBNB(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositBNB")
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

    describe("withdrawBNB() function test", function () {
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
                    .withdrawBNB(3, { gasPrice: 21e9 })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should receive the BNB successfully after withdraw function for Alice", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.aliceAddr);
            const beforeOwnerBNB = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let aliceInfo = (
                await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.withdrawBNB(1, { gasPrice });
            await expect(
                this.investor.connect(this.alice).withdrawBNB(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.aliceAddr);
            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterBNB.sub(beforeBNB);
            const afterOwnerBNB = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(aliceInfo)) {
                actualPending = actualPending.sub(BigNumber.from(aliceInfo));
                const protocolFee = afterOwnerBNB.sub(beforeOwnerBNB);
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

        it("(4) should receive the BNB successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);
            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.bobAddr);
            const beforeOwnerBNB = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let bobInfo = (
                await this.aAdapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.bob)
                .estimateGas.withdrawBNB(1, { gasPrice });
            await expect(
                this.investor.connect(this.bob).withdrawBNB(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterBNB.sub(beforeBNB);
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(bobInfo)) {
                actualPending = actualPending - bobInfo;
                const afterOwnerBNB = await ethers.provider.getBalance(
                    this.treasuryAddr
                );
                const protocolFee = afterOwnerBNB.sub(beforeOwnerBNB);
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
