const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

const { setPath } = require("../../../../shared/utilities");
const {
    adapterFixtureBsc,
    investorFixtureBsc,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("VenusLendAdapterBsc Integration Test", function () {
    before("Deploy contract", async function () {
        const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address
        const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        const busd = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
        const vbusd = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";

        const [owner, alice, bob, treasury] = await ethers.getSigners();

        this.performanceFee = 50;
        this.alice = alice;
        this.owner = owner;
        this.bob = bob;
        this.strategy = vbusd;
        this.busd = busd;

        // Deploy VenusLendAdapterBsc contract
        const VenusLendAdapterBsc = await adapterFixtureBsc(
            "VenusLendAdapterBsc"
        );

        this.adapter = await VenusLendAdapterBsc.deploy(
            this.strategy,
            busd,
            vbusd,
            swapRouter,
            wbnb,
            "Venus::BUSD::Lend"
        );
        await this.adapter.deployed();

        [this.adapterInfo, this.investor, this.ybNft] =
            await investorFixtureBsc(
                this.adapter,
                treasury.address,
                busd,
                this.performanceFee
            );

        await setPath(this.adapter, wbnb, busd);

        console.log("YBNFT: ", this.ybNft.address);
        console.log("Investor: ", this.investor.address);
        console.log("VenusAdapter: ", this.adapter.address);
        console.log("Strategy: ", this.strategy);
        console.log("Owner: ", this.owner.address);

        this.vBUSD = await ethers.getContractAt("VBep20Interface", vbusd);
        this.BUSD = await ethers.getContractAt("VBep20Interface", busd);
        this.WBNB = await ethers.getContractAt("VBep20Interface", wbnb);
    });

    describe("should set correct state variable", function () {
        it("(1) Check strategy address", async function () {
            expect(await this.adapter.strategy()).to.eq(this.strategy);
        });

        it("(2) Check owner wallet", async function () {
            expect(await this.adapter.owner()).to.eq(this.owner.address);
        });

        it("(3) Check owner wallet", async function () {
            expect(await this.adapter.owner()).to.eq(this.owner.address);
        });

        it("(4) Check AdapterInfo of YBNFT", async function () {
            const response = await this.ybNft.getAdapterInfo(1);
            expect(response[0].allocation).to.eq(10000) &&
                expect(response[0].token).to.eq(this.busd) &&
                expect(response[0].addr).to.eq(this.adapter.address);
        });
    });

    describe("deposit() function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor.depositBNB(3, depositAmount.toString(), {
                    gasPrice: 21e9,
                    value: depositAmount.toString(),
                })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2)should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositBNB(1, depositAmount.toString(), {
                    gasPrice: 21e9,
                    value: depositAmount.toString(),
                })
            ).to.be.revertedWith("Error: Insufficient BNB");
        });

        it("(3)should success 1 time and receive the vToken successfully after deposit function", async function () {
            const depositAmount = ethers.utils.parseEther("1");

            await this.investor.depositBNB(1, depositAmount, {
                gasPrice: 21e9,
                value: depositAmount.toString(),
            });

            expect(
                BigNumber.from(
                    await this.vBUSD.balanceOf(this.adapter.address)
                ).gt(0)
            ).to.eq(true);
        });

        it("(4)should success multiple times", async function () {
            // deposit to nftID: 1
            let vBeforeBal = BigNumber.from(
                await this.vBUSD.balanceOf(this.adapter.address)
            );

            const depositAmount = ethers.utils.parseEther("1");
            await this.investor.depositBNB(1, depositAmount.toString(), {
                gasPrice: 21e9,
                value: depositAmount.toString(),
            });

            await this.investor.depositBNB(2, depositAmount.toString(), {
                gasPrice: 21e9,
                value: depositAmount.toString(),
            });

            let vAfterBal = BigNumber.from(
                await this.vBUSD.balanceOf(this.adapter.address)
            );

            expect(vAfterBal.gt(vBeforeBal)).to.eq(true);
        });
    });

    describe("withdraw() function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {
            // withdraw to nftID: 3
            await expect(
                this.investor.withdrawBNB(3, {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2)should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor
                    .connect(this.bob)
                    .depositBNB(1, depositAmount.toString(), {
                        gasPrice: 21e9,
                    })
            ).to.be.revertedWith("Error: Insufficient BNB");
        });

        it("(3)should receive the WBNB successfully after withdraw function", async function () {
            // withdraw from nftId: 1
            let bnbBalBefore = await ethers.provider.getBalance(
                this.owner.address
            );
            await this.investor.withdrawBNB(1, {
                gasPrice: 21e9,
            });

            let bnbBalAfter = await ethers.provider.getBalance(
                this.owner.address
            );
            expect(
                BigNumber.from(bnbBalAfter).gte(BigNumber.from(bnbBalBefore))
            ).to.eq(true);

            // withdraw from nftId: 2
            bnbBalBefore = await ethers.provider.getBalance(this.owner.address);
            await this.investor.withdrawBNB(2, {
                gasPrice: 21e9,
            });

            bnbBalAfter = await ethers.provider.getBalance(this.owner.address);
            expect(
                BigNumber.from(bnbBalAfter).gte(BigNumber.from(bnbBalBefore))
            ).to.eq(true);
        });
    });
});
