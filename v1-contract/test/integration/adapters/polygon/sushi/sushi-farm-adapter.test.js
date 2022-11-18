const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const unlockAccount = async (address) => {
    await hre.network.provider.send("hardhat_impersonateAccount", [address]);
    return hre.ethers.provider.getSigner(address);
};

const forkNetwork = async () => {
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [
            {
                forking: {
                    jsonRpcUrl: "https://polygon-rpc.com",
                },
            },
        ],
    });
};

describe("SushiSwapFarmLPAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        await forkNetwork();

        const [owner, alice, bob, tom] = await ethers.getSigners();

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
        this.accTokenPerShare = BigNumber.from(0);
        this.accTokenPerShare1 = BigNumber.from(0);

        // Get existing contract handle
        this.sushiToken = await ethers.getContractAt("IBEP20", this.sushi);

        // Deploy Pancakeswap LP Adapter contract
        const SushiLPAdapter = await ethers.getContractFactory(
            "SushiSwapLPAdapter"
        );

        this.aAdapter = await SushiLPAdapter.deploy(
            // 11, // pid
            3,
            strategy,
            lpToken,
            wmatic,
            sushi,
            this.sushiRouter,
            "SushiSwap::Farm::DAI-USDC"
        );
        await this.aAdapter.deployed();

        // Deploy YBNFT contract
        const ybNftFactory = await ethers.getContractFactory("YBNFT");
        this.ybNft = await ybNftFactory.deploy();

        const Lib = await ethers.getContractFactory("HedgepieLibraryMatic");
        const lib = await Lib.deploy();

        // Deploy Investor contract
        const investorFactory = await ethers.getContractFactory(
            "HedgepieInvestorMatic",
            {
                libraries: {
                    HedgepieLibraryMatic: lib.address,
                },
            }
        );
        this.investor = await investorFactory.deploy(
            this.ybNft.address,
            swapRouter,
            wmatic
        );

        // Deploy Adaptor Manager contract
        const adapterManager = await ethers.getContractFactory(
            "HedgepieAdapterManager"
        );
        this.adapterManager = await adapterManager.deploy();

        // set investor
        await this.aAdapter.setInvestor(this.investor.address);

        // Mint NFTs
        // tokenID: 1
        await this.ybNft.mint(
            [10000],
            [lpToken],
            [this.aAdapter.address],
            performanceFee,
            "test tokenURI1"
        );

        // tokenID: 2
        await this.ybNft.mint(
            [10000],
            [lpToken],
            [this.aAdapter.address],
            performanceFee,
            "test tokenURI2"
        );

        // Add Venus Adapter to AdapterManager
        await this.adapterManager.addAdapter(this.aAdapter.address);

        // Set investor in adapter manager
        await this.adapterManager.setInvestor(this.investor.address);

        // Set adapter manager in investor
        await this.investor.setAdapterManager(this.adapterManager.address);
        await this.investor.setTreasury(this.owner.address);

        // Set investor in pancake adapter
        await this.aAdapter.setInvestor(this.investor.address);
        await this.aAdapter.setPath(this.wmatic, this.sushi, [
            this.wmatic,
            this.sushi,
        ]);
        await this.aAdapter.setPath(this.sushi, this.wmatic, [
            this.sushi,
            this.wmatic,
        ]);
        await this.aAdapter.setPath(this.wmatic, this.usdc, [
            this.wmatic,
            this.usdc,
        ]);
        await this.aAdapter.setPath(this.usdc, this.wmatic, [
            this.usdc,
            this.wmatic,
        ]);
        await this.aAdapter.setPath(this.wmatic, this.dai, [
            this.wmatic,
            this.dai,
        ]);
        await this.aAdapter.setPath(this.dai, this.wmatic, [
            this.dai,
            this.wmatic,
        ]);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("SushiSwapFarmLPAdapter: ", this.aAdapter.address);

        this.lpContract = await ethers.getContractAt(
            "VBep20Interface",
            lpToken
        );
    });

    describe("depositMATIC function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositMATIC(
                        this.owner.address,
                        3,
                        depositAmount.toString(),
                        {
                            gasPrice: 21e9,
                            value: depositAmount,
                        }
                    )
            ).to.be.revertedWith("nft tokenId is invalid");
        });

        it("(2) should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositMATIC(
                    this.owner.address,
                    1,
                    depositAmount.toString(),
                    { gasPrice: 21e9 }
                )
            ).to.be.revertedWith("Amount can not be 0");
        });

        it("(3) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor
                    .connect(this.alice)
                    .depositMATIC(this.aliceAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.aliceAddr, this.ybNft.address, 1, depositAmount);

            const aliceInfo = await this.investor.userInfo(
                this.aliceAddr,
                this.ybNft.address,
                1
            );
            expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(10);

            const aliceAdapterInfos = await this.investor.userAdapterInfos(
                this.aliceAddr,
                1,
                this.aAdapter.address
            );
            const adapterInfos = await this.investor.adapterInfos(
                1,
                this.aAdapter.address
            );
            expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                BigNumber.from(aliceAdapterInfos.amount)
            );

            const aliceWithdrawAmount = await this.aAdapter.getWithdrawalAmount(
                this.aliceAddr,
                1
            );
            expect(BigNumber.from(aliceWithdrawAmount)).to.eq(
                BigNumber.from(aliceAdapterInfos.amount)
            );

            // Check accTokenPerShare Info
            this.accTokenPerShare = (
                await this.investor.adapterInfos(1, this.aAdapter.address)
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

            const beforeAdapterInfos = await this.investor.adapterInfos(
                1,
                this.aAdapter.address
            );
            const depositAmount = ethers.utils.parseEther("10");

            await expect(
                this.investor
                    .connect(this.bob)
                    .depositMATIC(this.bobAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            await expect(
                this.investor
                    .connect(this.bob)
                    .depositMATIC(this.bobAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositMATIC")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            const bobInfo = await this.investor.userInfo(
                this.bobAddr,
                this.ybNft.address,
                1
            );
            expect(Number(bobInfo) / Math.pow(10, 18)).to.eq(20);

            const bobAdapterInfos = await this.investor.userAdapterInfos(
                this.bobAddr,
                1,
                this.aAdapter.address
            );
            expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

            const afterAdapterInfos = await this.investor.adapterInfos(
                1,
                this.aAdapter.address
            );

            expect(
                BigNumber.from(afterAdapterInfos.totalStaked).gt(
                    beforeAdapterInfos.totalStaked
                )
            ).to.eq(true);

            const bobWithdrable = await this.aAdapter.getWithdrawalAmount(
                this.bobAddr,
                1
            );
            expect(BigNumber.from(bobWithdrable)).to.eq(
                BigNumber.from(bobAdapterInfos.amount)
            );

            // Check accTokenPerShare Info
            expect(
                BigNumber.from(
                    (await this.investor.adapterInfos(1, this.aAdapter.address))
                        .accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.investor.adapterInfos(1, this.aAdapter.address)
            ).accTokenPerShare;
            this.accTokenPerShare1 = (
                await this.investor.adapterInfos(1, this.aAdapter.address)
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
                this.aliceAddr,
                1
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
            const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo.tvl).toString()
                    )
                )
            ).to.be.eq(30) &&
                expect(
                    BigNumber.from(nftInfo.totalParticipant).toString()
                ).to.be.eq("2");
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
                this.investor.withdrawMATIC(this.owner.address, 3, {
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
                    .withdrawMATIC(this.aliceAddr, 1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawMATIC");

            const afterMATIC = await ethers.provider.getBalance(this.aliceAddr);

            expect(
                BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))
            ).to.eq(true);

            const aliceInfo = await this.investor.userInfo(
                this.aliceAddr,
                this.ybNft.address,
                1
            );
            expect(aliceInfo).to.eq(BigNumber.from(0));

            const aliceWithdrable = await this.aAdapter.getWithdrawalAmount(
                this.aliceAddr,
                1
            );
            expect(BigNumber.from(aliceWithdrable)).to.eq(BigNumber.from(0));

            const bobInfo = await this.investor.userInfo(
                this.bobAddr,
                this.ybNft.address,
                1
            );
            const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
            expect(bobDeposit).to.eq(20);

            const bobWithdrable = await this.aAdapter.getWithdrawalAmount(
                this.bobAddr,
                1
            );
            expect(BigNumber.from(bobWithdrable).gt(0)).to.eq(true);

            expect(
                BigNumber.from(
                    (await this.investor.adapterInfos(1, this.aAdapter.address))
                        .accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true) &&
                expect(
                    BigNumber.from(
                        (
                            await this.investor.adapterInfos(
                                1,
                                this.aAdapter.address
                            )
                        ).accTokenPerShare1
                    ).gt(BigNumber.from(this.accTokenPerShare1))
                ).to.eq(true);

            this.accTokenPerShare = (
                await this.investor.adapterInfos(1, this.aAdapter.address)
            ).accTokenPerShare;
            this.accTokenPerShare1 = (
                await this.investor.adapterInfos(1, this.aAdapter.address)
            ).accTokenPerShare1;
        });

        it("(3) test TVL & participants after Alice withdraw", async function () {
            const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo.tvl).toString()
                    )
                )
            ).to.be.eq(20) &&
                expect(
                    BigNumber.from(nftInfo.totalParticipant).toString()
                ).to.be.eq("1");
        });

        it("(4) should receive the MATIC successfully after withdraw function for Bob", async function () {
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);
            // withdraw from nftId: 1
            const beforeMATIC = await ethers.provider.getBalance(this.bobAddr);

            await expect(
                this.investor
                    .connect(this.bob)
                    .withdrawMATIC(this.bobAddr, 1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawMATIC");

            const afterMATIC = await ethers.provider.getBalance(this.bobAddr);

            expect(
                BigNumber.from(afterMATIC).gt(BigNumber.from(beforeMATIC))
            ).to.eq(true);

            const bobInfo = await this.investor.userInfo(
                this.bobAddr,
                this.ybNft.address,
                1
            );
            expect(bobInfo).to.eq(BigNumber.from(0));

            const bobWithdrable = await this.aAdapter.getWithdrawalAmount(
                this.bobAddr,
                1
            );
            expect(BigNumber.from(bobWithdrable)).to.eq(BigNumber.from(0));

            // Check accTokenPerShare Info
            expect(
                BigNumber.from(
                    (await this.investor.adapterInfos(1, this.aAdapter.address))
                        .accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true) &&
                expect(
                    BigNumber.from(
                        (
                            await this.investor.adapterInfos(
                                1,
                                this.aAdapter.address
                            )
                        ).accTokenPerShare1
                    ).gt(BigNumber.from(this.accTokenPerShare1))
                ).to.eq(true);
            this.accTokenPerShare = (
                await this.investor.adapterInfos(1, this.aAdapter.address)
            ).accTokenPerShare;
            this.accTokenPerShare1 = (
                await this.investor.adapterInfos(1, this.aAdapter.address)
            ).accTokenPerShare1;
        });

        it("(5) test TVL & participants after Alice & Bob withdraw", async function () {
            const nftInfo = await this.investor.nftInfo(this.ybNft.address, 1);

            expect(
                Number(
                    ethers.utils.formatEther(
                        BigNumber.from(nftInfo.tvl).toString()
                    )
                )
            ).to.be.eq(0) &&
                expect(
                    BigNumber.from(nftInfo.totalParticipant).toString()
                ).to.be.eq("0");
        });
    });
});
