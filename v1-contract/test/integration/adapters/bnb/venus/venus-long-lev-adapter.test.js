const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const { setPath } = require("../../../../shared/utilities");
const {
    adapterFixtureBsc,
    investorFixtureBsc,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("VenusLongLevAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        const [owner, alice, bob, tom, treasury] = await ethers.getSigners();

        const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
        const vBusd = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
        const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address

        this.wbnb = wbnb;

        this.performanceFee = 50;
        this.owner = owner;
        this.busd = busd;
        this.alice = alice;
        this.bob = bob;
        this.tom = tom;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.tomAddr = tom.address;
        this.treasuryAddr = treasury.address;

        // Get existing contract handle
        this.busdToken = await ethers.getContractAt("IBEP20", this.busd);
        this.vBusd = await ethers.getContractAt("IBEP20", vBusd);

        // Deploy VenusLevAdapterBsc contract
        const VenusLevAdapterBsc = await adapterFixtureBsc(
            "VenusLevAdapterBsc"
        );

        this.adapter = await VenusLevAdapterBsc.deploy(
            this.vBusd.address,
            swapRouter,
            wbnb,
            4,
            "Venus::BUSD Long Leverage Adapter"
        );
        await this.adapter.deployed();

        [this.adapterInfo, this.investor, this.ybNft] =
            await investorFixtureBsc(
                this.adapter,
                treasury.address,
                busd,
                this.performanceFee
            );

        await setPath(this.adapter, this.wbnb, this.busd);

        console.log("Owner: ", this.owner.address);
        console.log("YBNFT: ", this.ybNft.address);
        console.log("Investor: ", this.investor.address);
        console.log("VenusAdapter: ", this.adapter.address);
        console.log("Strategy: ", this.vBusd.address);
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

        it("(3) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor.connect(this.alice).depositBNB(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositBNB")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            const aliceInfo = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            expect(Number(aliceInfo.invested) / Math.pow(10, 18)).to.eq(10);

            const adapterInfo = await this.adapter.adapterInfos(1);
            expect(BigNumber.from(adapterInfo.totalStaked)).to.eq(
                BigNumber.from(aliceInfo.amount)
            );
        });

        it("(4) deposit should success for Bob", async function () {
            const beforeAdapterInfos = await this.adapter.adapterInfos(1);
            const depositAmount = ethers.utils.parseEther("20");

            await expect(
                this.investor.connect(this.bob).depositBNB(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositBNB")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            const bobInfo = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(Number(bobInfo.invested) / Math.pow(10, 18)).to.eq(20);
            expect(BigNumber.from(bobInfo.amount).gt(0)).to.eq(true);

            const afterAdapterInfos = await this.adapter.adapterInfos(1);

            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).gt(
                    beforeAdapterInfos.totalStaked
                )
            ).to.eq(true);
        });
    });

    describe("withdrawBNB() function test", function () {
        it("(1) revert when nft tokenId is invalid", async function () {
            for (let i = 0; i < 10; i++) {
                await ethers.provider.send("evm_mine", []);
            }
            // withdraw to nftID: 3
            await expect(
                this.investor.withdrawBNB(3, {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should receive the BNB successfully after withdraw function for Alice", async function () {
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
            const aliceInfo = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            expect(aliceInfo.invested).to.eq(BigNumber.from(0));
            const aliceWithdrable = await this.adapter.stackWithdrawalAmounts(
                this.aliceAddr,
                1,
                0
            );
            expect(BigNumber.from(aliceWithdrable)).to.eq(BigNumber.from(0));

            const bobInfo = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            const bobDeposit = Number(bobInfo.invested) / Math.pow(10, 18);
            expect(bobDeposit).to.eq(20);
            const bobWithdrable = await this.adapter.stackWithdrawalAmounts(
                this.bobAddr,
                1,
                0
            );
            expect(BigNumber.from(bobWithdrable).gt(0)).to.eq(true);
        });

        it("(3) should receive the BNB successfully after withdraw function for Bob", async function () {
            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.bobAddr);
            await expect(
                this.investor
                    .connect(this.bob)
                    .withdrawBNB(1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawBNB");
            const afterBNB = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
            ).to.eq(true);
            const bobInfo = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(bobInfo.invested).to.eq(BigNumber.from(0));
            const bobWithdrable = await this.adapter.stackWithdrawalAmounts(
                this.bobAddr,
                1,
                0
            );
            expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(0));
        });
    });
});
