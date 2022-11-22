const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkETHNetwork } = require('../../../../shared/utilities');
const { adapterFixture, investorFixture } = require('../../../../shared/fixtures');

const BigNumber = ethers.BigNumber;

describe("PickleSushiFarmAdapterEth Integration Test", function () {
    before("Deploy contract", async function () {
        await forkETHNetwork();

        const [owner, alice, bob, treasury] = await ethers.getSigners();

        const performanceFee = 100;
        const pid = 20;
        const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const pickle = "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5";
        const wbtc = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"; // WBTC
        const strategy = "0xbD17B1ce622d73bD438b9E658acA5996dc394b0d"; // MasterChef V1
        const swapRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"; // sushi router address
        const lpToken = "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58"; // WBTC-WETH LP
        const jar = "0xde74b6c547bd574c3527316a2eE30cd8F6041525"; // pickling SushiSwap WBTC-ETH(pSLP)

        this.performanceFee = performanceFee;

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.treasuryAddr = treasury.address;
        this.accTokenPerShare = BigNumber.from(0);
        this.accTokenPerShare1 = BigNumber.from(0);

        // Deploy PickleSushiAdapter contract
        const PickleSushiAdapter = await adapterFixture(
            "PickleSushiMasterAdapter"
        );
        this.aAdapter = await PickleSushiAdapter.deploy(
            pid,
            strategy,
            jar,
            lpToken,
            pickle,
            ethers.constants.AddressZero,
            swapRouter,
            weth,
            "Pickle::Sushi::WBTC-ETH"
        );
        await this.aAdapter.deployed();

        [
            this.adapterInfo,
            this.investor,
            this.ybNft
        ] = await investorFixture(
            this.aAdapter,
            treasury.address,
            lpToken,
            performanceFee
            );
        
        await setPath(this.aAdapter, weth, pickle);
        await setPath(this.aAdapter, weth, wbtc);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("Info: ", this.adapterInfo.address);
        console.log("PickleSushiFarmAdapter: ", this.aAdapter.address);
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
            // wait 7 day
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 7]);
            await ethers.provider.send("evm_mine", []);

            const beforeETH = await ethers.provider.getBalance(this.aliceAddr);
            const beforeETHOwner = await ethers.provider.getBalance(
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

            const afterETH = await ethers.provider.getBalance(this.aliceAddr);
            const protocolFee = (
                await ethers.provider.getBalance(this.owner.address)
            ).sub(beforeETHOwner);
            const actualPending = afterETH
                .sub(beforeETH)
                .add(gas.mul(gasPrice));

            if (pending > 0) {
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
            }
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
            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.aliceAddr);
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.owner.address
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
                this.owner.address
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

            expect(
                BigNumber.from(
                    (await this.aAdapter.adapterInfos(1)).accTokenPerShare
                ).gte(BigNumber.from(this.accTokenPerShare))
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

        it("(4) should receive the ETH successfully after withdraw function for Bob", async function () {
            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.bobAddr);
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.owner.address
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
                this.owner.address
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
