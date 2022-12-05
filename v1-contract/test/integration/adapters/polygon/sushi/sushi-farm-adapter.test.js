const { expect } = require("chai");
const { ethers } = require("hardhat");

const { setPath, forkPolygonNetwork } = require("../../../../shared/utilities");
const {
    adapterFixtureMatic,
    investorFixtureMatic,
} = require("../../../../shared/fixtures");

const BigNumber = ethers.BigNumber;

describe("SushiSwapFarmLPAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        await forkPolygonNetwork();

        const [owner, alice, bob, tom, treasury] = await ethers.getSigners();

        const performanceFee = 100;
        const wmatic = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        const sushi = "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a";
        // const dai = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
        const dai = "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6";
        // const usdc = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
        const usdc = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
        const strategy = "0x0769fd68dfb93167989c6f7254cd0d766fb2841f"; // MiniChef v2
        const swapRouter = "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506"; // sushi rounter address
        // const lpToken = "0xcd578f016888b57f1b1e3f887f392f0159e26747"; // DAI-USDC LP
        const lpToken = "0xE62Ec2e799305E0D367b0Cc3ee2CdA135bF89816"; // WETH-WBTC LP

        this.performanceFee = performanceFee;
        this.wmatic = wmatic;
        this.dai = dai;
        this.usdc = usdc;
        this.sushi = sushi;

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.tom = tom;
        this.sushiRouter = "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506";

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.tomAddr = tom.address;
        this.treasuryAddr = treasury.address;

        this.accTokenPerShare = BigNumber.from(0);
        this.accTokenPerShare1 = BigNumber.from(0);

        // Deploy SushiSwapLPAdapterMatic Adapter contract
        const SushiLPAdapter = await adapterFixtureMatic(
            "SushiSwapLPAdapterMatic"
        );
        this.adapter = await SushiLPAdapter.deploy(
            3,
            strategy,
            lpToken,
            wmatic,
            sushi,
            swapRouter,
            swapRouter,
            wmatic,
            "SushiSwap::Farm::WETH-WBTC"
        );

        await this.adapter.deployed();

        [this.adapterInfo, this.investor, this.ybNft] =
            await investorFixtureMatic(
                this.adapter,
                treasury.address,
                lpToken,
                performanceFee
            );

        await setPath(this.adapter, this.wmatic, this.sushi);
        await setPath(this.adapter, this.wmatic, this.usdc);
        await setPath(this.adapter, this.wmatic, this.dai);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("SushiSwapFarmLPAdapter: ", this.adapter.address);
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
            ).to.be.revertedWith("nft tokenId is invalid");
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
                this.investor
                    .connect(this.alice)
                    .depositMATIC(1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            const aliceInfo = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            const adapterInfos = await this.adapter.adapterInfos(1);

            expect(Number(aliceInfo.invested) / Math.pow(10, 18)).to.eq(10);
            expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                BigNumber.from(aliceInfo.amount)
            );

            // Check accTokenPerShare Info
            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
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

            const beforeAdapterInfos = await this.adapter.adapterInfos(1);
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

            // Check accTokenPerShare Info
            expect(
                BigNumber.from(
                    (await this.adapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare;
            this.accTokenPerShare1 = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare1;
        });

        it("(5) test claim, pendingReward function and protocol-fee", async function () {
            const beforeMATIC = await ethers.provider.getBalance(
                this.aliceAddr
            );
            const beforeMATICOwner = await ethers.provider.getBalance(
                this.owner.address
            );
            const pending = await this.investor.pendingReward(
                1,
                this.aliceAddr
            );

            await this.investor.connect(this.alice).claim(1);
            const gasPrice = await ethers.provider.getGasPrice();
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.claim(1);

            const afterMATIC = await ethers.provider.getBalance(this.aliceAddr);
            const protocolFee = (
                await ethers.provider.getBalance(this.owner.address)
            ).sub(beforeMATICOwner);

            const actualPending = afterMATIC
                .sub(beforeMATIC)
                .add(gas.mul(gasPrice));

            expect(pending).to.be.within(
                actualPending,
                actualPending.add(BigNumber.from(2e14))
            ) &&
                expect(protocolFee).to.be.within(
                    actualPending.mul(this.performanceFee).div(1e4),
                    actualPending
                        .add(BigNumber.from(2e14))
                        .mul(this.performanceFee)
                        .div(1e4)
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
                this.investor.withdrawMATIC(3, {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("nft tokenId is invalid");
        });

        it("(2) should receive the MATIC successfully after withdraw function for Alice", async function () {
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
            expect(bobDeposit).to.eq(20);

            expect(
                BigNumber.from(
                    (await this.adapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true) &&
                expect(
                    BigNumber.from(
                        (await this.adapter.adapterInfos(1)).accTokenPerShare1
                    ).gt(BigNumber.from(this.accTokenPerShare1))
                ).to.eq(true);

            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare;
            this.accTokenPerShare1 = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare1;
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

        it("(4) should receive the MATIC successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);
            // withdraw from nftId: 1
            const beforeMATIC = await ethers.provider.getBalance(this.bobAddr);

            await expect(
                this.investor
                    .connect(this.bob)
                    .withdrawMATIC(1, { gasPrice: 21e9 })
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

            // Check accTokenPerShare Info
            expect(
                BigNumber.from(
                    (await this.adapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true) &&
                expect(
                    BigNumber.from(
                        (await this.adapter.adapterInfos(1)).accTokenPerShare1
                    ).gt(BigNumber.from(this.accTokenPerShare1))
                ).to.eq(true);
            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare;
            this.accTokenPerShare1 = (
                await this.adapter.adapterInfos(1)
            ).accTokenPerShare1;
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
