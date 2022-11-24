const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const unlockAccount = async (address) => {
    await hre.network.provider.send("hardhat_impersonateAccount", [address]);
    return hre.ethers.provider.getSigner(address);
};

describe("PancakeSwapFarmLPAdapter Integration Test", function () {
    before("Deploy contract", async function () {
        const [owner, alice, bob, tom] = await ethers.getSigners();

        const performanceFee = 100;
        const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
        const cake = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
        const whaleAddr = "0x41772edd47d9ddf9ef848cdb34fe76143908c7ad";
        const strategy = "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652"; // MasterChef v2 pks
        const swapRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // pks rounter address
        const lpToken = "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0"; // WBNB-CAKE LP

        this.performanceFee = performanceFee;
        this.wbnb = wbnb;
        this.cake = cake;

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.tom = tom;
        this.pksRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.tomAddr = tom.address;
        this.accTokenPerShare = BigNumber.from(0);

        // Get existing contract handle
        this.cakeToken = await ethers.getContractAt("IBEP20", this.cake);

        // Deploy Pancakeswap LP Adapter contract
        const PancakeLPAdapter = await ethers.getContractFactory(
            "PancakeSwapFarmLPAdapter"
        );
        this.aAdapter = await PancakeLPAdapter.deploy(
            2, // pid
            strategy,
            lpToken,
            this.cake,
            this.pksRouter,
            "PancakeSwap::Farm::CAKE-WBNB"
        );
        await this.aAdapter.deployed();

        // Deploy YBNFT contract
        const ybNftFactory = await ethers.getContractFactory("YBNFT");
        this.ybNft = await ybNftFactory.deploy();

        const Lib = await ethers.getContractFactory("HedgepieLibrary");
        const lib = await Lib.deploy();

        // Deploy Investor contract
        const investorFactory = await ethers.getContractFactory(
            "HedgepieInvestor",
            {
                libraries: {
                    HedgepieLibrary: lib.address,
                },
            }
        );
        this.investor = await investorFactory.deploy(
            this.ybNft.address,
            swapRouter,
            wbnb
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
        await this.aAdapter.setPath(this.wbnb, this.cake, [
            this.wbnb,
            this.cake,
        ]);
        await this.aAdapter.setPath(this.cake, this.wbnb, [
            this.cake,
            this.wbnb,
        ]);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("PancakeSwapFarmLPAdapter: ", this.aAdapter.address);

        this.whaleWallet = await unlockAccount(whaleAddr);
        this.lpContract = await ethers.getContractAt(
            "VBep20Interface",
            lpToken
        );
    });

    describe("depositBNB function test", function () {
        it("(1) should be reverted when nft tokenId is invalid", async function () {
            // deposit to nftID: 3
            const depositAmount = ethers.utils.parseEther("1");
            await expect(
                this.investor
                    .connect(this.owner)
                    .depositBNB(
                        this.owner.address,
                        3,
                        depositAmount.toString(),
                        {
                            gasPrice: 21e9,
                            value: depositAmount,
                        }
                    )
            ).to.be.revertedWith("Error: nft tokenId is invalid");
        });

        it("(2) should be reverted when amount is 0", async function () {
            // deposit to nftID: 1
            const depositAmount = ethers.utils.parseEther("0");
            await expect(
                this.investor.depositBNB(
                    this.owner.address,
                    1,
                    depositAmount.toString(),
                    {
                        gasPrice: 21e9,
                    }
                )
            ).to.be.revertedWith("Error: Amount can not be 0");
        });

        it("(3) deposit should success for Alice", async function () {
            const depositAmount = ethers.utils.parseEther("10");
            await expect(
                this.investor
                    .connect(this.alice)
                    .depositBNB(this.aliceAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositBNB")
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

            const beforeAdapterInfos = await this.investor.adapterInfos(
                1,
                this.aAdapter.address
            );
            const depositAmount = ethers.utils.parseEther("10");

            await expect(
                this.investor
                    .connect(this.bob)
                    .depositBNB(this.bobAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositBNB")
                .withArgs(this.bobAddr, this.ybNft.address, 1, depositAmount);

            await expect(
                this.investor
                    .connect(this.bob)
                    .depositBNB(this.bobAddr, 1, depositAmount, {
                        gasPrice: 21e9,
                        value: depositAmount,
                    })
            )
                .to.emit(this.investor, "DepositBNB")
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
        });

        it("(5) test claim, pendingReward function and protocol-fee", async function () {
            const beforeBNB = await ethers.provider.getBalance(this.aliceAddr);
            const beforeBNBOwner = await ethers.provider.getBalance(
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

            const afterBNB = await ethers.provider.getBalance(this.aliceAddr);
            const protocolFee = (
                await ethers.provider.getBalance(this.owner.address)
            ).sub(beforeBNBOwner);
            const actualPending = afterBNB
                .sub(beforeBNB)
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

    describe("withdrawBNB() function test", function () {
        it("(1) revert when nft tokenId is invalid", async function () {
            for (let i = 0; i < 10; i++) {
                await ethers.provider.send("evm_mine", []);
            }

            // withdraw to nftID: 3
            await expect(
                this.investor.withdrawBNB(this.owner.address, 3, {
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
                    .withdrawBNB(this.aliceAddr, 1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.aliceAddr);

            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
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

        it("(4) should receive the BNB successfully after withdraw function for Bob", async function () {
            // withdraw from nftId: 1
            const beforeBNB = await ethers.provider.getBalance(this.bobAddr);

            await expect(
                this.investor
                    .connect(this.bob)
                    .withdrawBNB(this.bobAddr, 1, { gasPrice: 21e9 })
            ).to.emit(this.investor, "WithdrawBNB");

            const afterBNB = await ethers.provider.getBalance(this.bobAddr);

            expect(
                BigNumber.from(afterBNB).gt(BigNumber.from(beforeBNB))
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
            ).to.eq(true);
            this.accTokenPerShare = (
                await this.investor.adapterInfos(1, this.aAdapter.address)
            ).accTokenPerShare;
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
