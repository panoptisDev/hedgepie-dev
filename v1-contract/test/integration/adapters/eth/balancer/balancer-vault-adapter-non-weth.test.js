const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkETHNetwork } = require('../../../../shared/utilities');
const { adapterFixture, investorFixture } = require('../../../../shared/fixtures');

const BigNumber = ethers.BigNumber;

describe("BalancerVaultAdapterEth Integration Test", function () {
    before("Deploy contract", async function () {
        await forkETHNetwork();

        const [owner, alice, bob, treasury] = await ethers.getSigners();

        const performanceFee = 100;
        const pid =
            "0x496ff26b76b8d23bbc6cf1df1eee4a48795490f7000200000000000000000377";
        const wstETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
        const compound = "0xc00e94Cb662C3520282E6f5717214004A7f26888";
        const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const dai = "0x6b175474e89094c44da98b954eedeac495271d0f";
        const strategy = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"; // Balancer Vault
        const repayToken = "0x496ff26B76b8d23bbc6cF1Df1eeE4a48795490F7"; // Balancer 50COMP-50wstETH
        const swapRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"; // sushi router address

        this.performanceFee = performanceFee;

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.treasuryAddr = treasury.address;

        // Deploy BalancerVaultAdapterEth contract
        const SushiLPAdapter = await adapterFixture("BalancerVaultAdapterEth");
        this.aAdapter = await SushiLPAdapter.deploy(
            pid,
            strategy,
            repayToken,
            swapRouter,
            weth,
            [wstETH, compound],
            "Balancer::Vault::wsETH-Compound",
            
        );
        await this.aAdapter.deployed();

        [
            this.adapterInfo,
            this.investor,
            this.ybNft
        ] = await investorFixture(
            this.aAdapter,
            treasury.address,
            weth,
            performanceFee
        );

        // Set paths for swapping tokens
        await setPath(this.aAdapter, weth, wstETH, dai);
        await setPath(this.aAdapter, weth, compound);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("Info: ", this.adapterInfo.address);
        console.log("BalancerVaultAdapterEth: ", this.aAdapter.address);
    });

    describe("depositETH function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositETH(3, depositAmount.toString(), {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositETH(1, depositAmount.toString(), {
                    gasPrice: 21e9,
                })
            ).to.be.revertedWith("Error: Insufficient ETH");
        });

        it("(3) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor.connect(this.alice).depositETH(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositETH")
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
            console.log();
            expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                BigNumber.from(aliceAdapterInfos.amount)
            );
        });

        it("(4) deposit should success for Bob", async function () {
            const beforeAdapterInfos = await this.aAdapter.adapterInfos(1);
            const depositAmount = ethers.utils.parseEther("10");

            await expect(
                this.investor.connect(this.bob).depositETH(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositETH")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            await expect(
                this.investor.connect(this.bob).depositETH(1, depositAmount, {
                    gasPrice: 21e9,
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositETH")
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
        });

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
        });
    });

    describe("withdrawETH() function test", function () {
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
                    .withdrawETH(3, { gasPrice: 21e9 })
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should receive the ETH successfully after withdraw function for Alice", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.aliceAddr);
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let aliceInfo = (
                await this.aAdapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.withdrawETH(1, { gasPrice });
            await expect(
                this.investor.connect(this.alice).withdrawETH(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawETH");

            const afterETH = await ethers.provider.getBalance(this.aliceAddr);
            expect(
                BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterETH.sub(beforeETH);
            const afterOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(aliceInfo)) {
                actualPending = actualPending.sub(BigNumber.from(aliceInfo));
                const protocolFee = afterOwnerETH.sub(beforeOwnerETH);
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

        it("(4) should receive the ETH successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.bobAddr);
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let bobInfo = (
                await this.aAdapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.bob)
                .estimateGas.withdrawETH(1, { gasPrice });
            await expect(
                this.investor.connect(this.bob).withdrawETH(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawETH");

            const afterETH = await ethers.provider.getBalance(this.bobAddr);
            expect(
                BigNumber.from(afterETH).gt(BigNumber.from(beforeETH))
            ).to.eq(true);

            // check protocol fee
            const rewardAmt = afterETH.sub(beforeETH);
            const afterOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(bobInfo)) {
                actualPending = actualPending.sub(BigNumber.from(bobInfo));
                const protocolFee = afterOwnerETH.sub(beforeOwnerETH);
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
