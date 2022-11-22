const { expect } = require("chai");
const { ethers } = require("hardhat");
const { setPath, forkETHNetwork } = require('../../../../shared/utilities');
const { adapterFixture, investorFixture } = require('../../../../shared/fixtures');

const BigNumber = ethers.BigNumber;

describe("UniswapV3LPAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        await forkETHNetwork();

        const [owner, alice, bob, tom, treasury] = await ethers.getSigners();

        const performanceFee = 50;
        const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const matic = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0";
        const strategy = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"; // NonfungiblePositionManager
        const stakingToken = "0x290A6a7460B308ee3F19023D2D00dE604bcf5B42"; // Matic-WETH Uniswap v3 pool
        const swapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 router address

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.tom = tom;

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.tomAddr = tom.address;
        this.treasuryAddr = treasury.address;

        this.lower = -75480;
        this.upper = -75420;

        // Deploy UniswapV3LPAdapter contract
        const UniswapV3LpAdapter = await adapterFixture(
            "UniswapV3LPAdapter"
        );
        this.adapter = await UniswapV3LpAdapter.deploy(
            strategy,
            stakingToken,
            swapRouter,
            this.lower,
            this.upper,
            weth,
            "UniswapV3::Matic-WETH::LP"
        );
        await this.adapter.deployed();

        [
            this.adapterInfo,
            this.investor,
            this.ybNft
        ] = await investorFixture(
            this.adapter,
            treasury.address,
            stakingToken,
            performanceFee
        );

        // set path
        await setPath(this.adapter, weth, matic);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("UniswapV3LPAdapter: ", this.adapter.address);
    });

    describe("depositETH function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositETH(3, depositAmount.toString(), {
                        value: depositAmount,
                    })
            ).to.be.revertedWith("nft tokenId is invalid");
        });

        it("(2)should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositETH(1, depositAmount)
            ).to.be.revertedWith("Error: Insufficient ETH");
        });

        it("(3)deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            const beforeETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            await expect(
                this.investor.connect(this.alice).depositETH(1, depositAmount, {
                    value: depositAmount,
                })
            )
                .to.emit(this.investor, "DepositETH")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            // compare user info
            const aliceInfo = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            expect(aliceInfo.invested).to.lte(depositAmount);
            expect(aliceInfo.amount).to.be.gt(0);

            // compare adapter info
            const adapterInfos = await this.adapter.adapterInfos(1);
            expect(adapterInfos.totalStaked).to.eq(aliceInfo.amount);

            // compare ETH in adapter contract
            const afterETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            expect(afterETH).to.eq(beforeETH);
        });

        it("(4)deposit should success for Bob", async function () {
            const adapterInfoBefore = await this.adapter.adapterInfos(1);
            const beforeETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            const depositAmount = ethers.utils.parseEther("10");
            await this.investor.connect(this.bob).depositETH(1, depositAmount, {
                value: depositAmount,
            });
            await this.investor.connect(this.bob).depositETH(1, depositAmount, {
                value: depositAmount,
            });

            // compare user info
            const bobInfo = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(bobInfo.invested).to.lte(ethers.utils.parseEther("20"));
            expect(bobInfo.amount).to.be.gt(0);

            // compare adapter info
            const adapterInfoAfter = await this.adapter.adapterInfos(1);
            expect(adapterInfoAfter.totalStaked).to.be.gt(
                adapterInfoBefore.totalStaked
            );

            // compare ETH in adapter contract
            const afterETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            expect(afterETH).to.eq(beforeETH);
        }).timeout(50000000);

        it("(5)deposit should success for Tom", async function () {
            const adapterInfoBefore = await this.adapter.adapterInfos(1);
            const beforeETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            const depositAmount = ethers.utils.parseEther("30");
            await this.investor.connect(this.tom).depositETH(1, depositAmount, {
                value: depositAmount,
            });

            // compare user info
            const tomInfo = await this.adapter.userAdapterInfos(
                this.tomAddr,
                1
            );
            expect(tomInfo.invested).to.lte(depositAmount);
            expect(tomInfo.amount).to.be.gt(0);

            // compare adapter info
            const adapterInfoAfter = await this.adapter.adapterInfos(1);
            expect(adapterInfoAfter.totalStaked).to.be.gt(
                adapterInfoBefore.totalStaked
            );

            // compare ETH in adapter contract
            const afterETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            expect(afterETH).to.eq(beforeETH);
        }).timeout(50000000);

        it("(6)test TVL & participants", async function () {
            const nftInfo = await this.adapterInfo.adapterInfo(1);
            expect(nftInfo.tvl).to.be.lte(ethers.utils.parseEther("60"));
            expect(nftInfo.participant).to.be.eq("3");
        });
    });

    describe("withdrawETH() function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {
            // withdraw to nftID: 3
            await expect(this.investor.withdrawETH(3)).to.be.revertedWith(
                "Error: nft tokenId is invalid"
            );
        });

        it("(2)should receive ETH successfully after withdraw function for Alice", async function () {
            const ethBalBefore = await ethers.provider.getBalance(
                this.aliceAddr
            );
            const beforeETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            const aliceInfo = (
                await this.adapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.alice)
                .estimateGas.withdrawETH(1, { gasPrice });
            await expect(
                this.investor.connect(this.alice).withdrawETH(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawETH");

            // compare user info
            const ethBalAfter = await ethers.provider.getBalance(
                this.aliceAddr
            );
            expect(ethBalAfter).to.gt(ethBalBefore);

            // check protocol fee
            const rewardAmt = ethBalAfter.sub(ethBalBefore);
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

            // compare adapter info
            const aliceAdapterInfo = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            expect(aliceAdapterInfo.invested).to.eq("0");

            // compare ETH in adapter contract
            const afterETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            expect(afterETH).to.eq(beforeETH);
        }).timeout(50000000);

        it("(3)should receive ETH successfully after withdraw function for Bob", async function () {
            const ethBalBefore = await ethers.provider.getBalance(this.bobAddr);
            const beforeETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            const bobInfo = (
                await this.adapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.bob)
                .estimateGas.withdrawETH(1, { gasPrice });
            await expect(
                this.investor.connect(this.bob).withdrawETH(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawETH");
            const ethBalAfter = await ethers.provider.getBalance(this.bobAddr);
            expect(ethBalAfter).to.gt(ethBalBefore);

            // check protocol fee
            const rewardAmt = ethBalAfter.sub(ethBalBefore);
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

            // compare adapter info
            const bobAdapterInfo = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(bobAdapterInfo.invested).to.eq("0");

            // compare ETH in adapter contract
            const afterETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            expect(afterETH).to.eq(beforeETH);
        }).timeout(50000000);

        it("(4)should receive ETH successfully after withdraw function for Tom", async function () {
            const ethBalBefore = await ethers.provider.getBalance(this.tomAddr);
            const beforeETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.treasuryAddr
            );
            const tomInfo = (
                await this.adapter.userAdapterInfos(this.tomAddr, 1)
            ).invested;

            const gasPrice = 21e9;
            const gas = await this.investor
                .connect(this.tom)
                .estimateGas.withdrawETH(1, { gasPrice });
            await expect(
                this.investor.connect(this.tom).withdrawETH(1, { gasPrice })
            ).to.emit(this.investor, "WithdrawETH");

            const ethBalAfter = await ethers.provider.getBalance(this.tomAddr);
            expect(ethBalAfter).to.gt(ethBalBefore);

            // check protocol fee
            const rewardAmt = ethBalAfter.sub(ethBalBefore);
            let actualPending = rewardAmt.add(gas.mul(gasPrice));
            if (actualPending.gt(tomInfo)) {
                actualPending = actualPending - tomInfo;
                const afterOwnerETH = await ethers.provider.getBalance(
                    this.treasuryAddr
                );
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

            // compare adapter info
            const tomAdapterInfo = await this.adapter.userAdapterInfos(
                this.tomAddr,
                1
            );
            expect(tomAdapterInfo.invested).to.eq("0");

            // compare ETH in adapter contract
            const afterETH = await ethers.provider.getBalance(
                this.adapter.address
            );
            expect(afterETH).to.eq(beforeETH);
        }).timeout(50000000);
    });
});
