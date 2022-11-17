const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

const forkNetwork = async () => {
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [
            {
                forking: {
                    jsonRpcUrl: "https://rpc.ankr.com/eth",
                },
            },
        ],
    });
};

describe("SushiFarmV2AdapterEth Integration Test", function () {
    before("Deploy contract", async function () {
        await forkNetwork();

        const [owner, alice, bob, tom, treasury] = await ethers.getSigners();

        const performanceFee = 100;
        const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const sushi = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2";
        const radar = "0x44709a920fCcF795fbC57BAA433cc3dd53C44DbE";
        const strategy = "0xef0881ec094552b2e128cf945ef17a6752b4ec5d"; // MasterChef V1
        const swapRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"; // sushi router address
        const lpToken = "0x559eBE4E206e6B4D50e9bd3008cDA7ce640C52cb"; // RADAR-WETH LP

        this.performanceFee = performanceFee;
        this.weth = weth;
        this.radar = radar;
        this.sushi = sushi;

        this.owner = owner;
        this.alice = alice;
        this.bob = bob;
        this.tom = tom;
        this.sushiRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

        this.bobAddr = bob.address;
        this.aliceAddr = alice.address;
        this.tomAddr = tom.address;
        this.treasuryAddr = treasury.address;
        this.accTokenPerShare = BigNumber.from(0);
        this.accTokenPerShare1 = BigNumber.from(0);

        // Get existing contract handle
        this.sushiToken = await ethers.getContractAt("IBEP20", this.sushi);

        // Deploy Pancakeswap LP Adapter contract
        const Lib = await ethers.getContractFactory("HedgepieLibraryEth");
        const lib = await Lib.deploy();
        const SushiLPAdapter = await ethers.getContractFactory(
            "SushiFarmV2AdapterEth",
            {
                libraries: {
                    HedgepieLibraryEth: lib.address,
                },
            }
        );

        this.adapter = await SushiLPAdapter.deploy(
            42,
            strategy,
            lpToken,
            radar,
            sushi,
            this.sushiRouter,
            swapRouter,
            "SushiSwap::Farm::RADAR-ETH",
            weth
        );
        await this.adapter.deployed();

        // Deploy YBNFT contract
        const ybNftFactory = await ethers.getContractFactory("YBNFT");
        this.ybNft = await ybNftFactory.deploy();

        // Deploy Adaptor Info contract
        const adapterInfo = await ethers.getContractFactory(
            "HedgepieAdapterInfoEth"
        );
        this.adapterInfo = await adapterInfo.deploy();
        await this.adapterInfo.setManager(this.adapter.address, true);

        // Deploy Investor contract
        const investorFactory = await ethers.getContractFactory(
            "HedgepieInvestorEth"
        );
        this.investor = await investorFactory.deploy(
            this.ybNft.address,
            this.treasuryAddr,
            this.adapterInfo.address
        );

        // Deploy Adaptor Manager contract
        const adapterManager = await ethers.getContractFactory(
            "HedgepieAdapterManagerEth"
        );
        this.adapterManager = await adapterManager.deploy();

        // set investor
        await this.adapter.setInvestor(this.investor.address);

        // Mint NFTs
        // tokenID: 1
        await this.ybNft.mint(
            [10000],
            [lpToken],
            [this.adapter.address],
            performanceFee,
            "test tokenURI1"
        );

        // tokenID: 2
        await this.ybNft.mint(
            [10000],
            [lpToken],
            [this.adapter.address],
            performanceFee,
            "test tokenURI2"
        );

        // Add Venus Adapter to AdapterManager
        await this.adapterManager.addAdapter(this.adapter.address);

        // Set investor in adapter manager
        await this.adapterManager.setInvestor(this.investor.address);

        // Set adapter manager in investor
        await this.investor.setAdapterManager(this.adapterManager.address);
        await this.investor.setTreasury(this.owner.address);

        // Set investor in pancake adapter
        await this.adapter.setInvestor(this.investor.address);
        await this.adapter.setPath(this.weth, this.sushi, [
            this.weth,
            this.sushi,
        ]);
        await this.adapter.setPath(this.sushi, this.weth, [
            this.sushi,
            this.weth,
        ]);
        await this.adapter.setPath(this.weth, this.radar, [
            this.weth,
            this.radar,
        ]);
        await this.adapter.setPath(this.radar, this.weth, [
            this.radar,
            this.weth,
        ]);

        console.log("Owner: ", this.owner.address);
        console.log("Investor: ", this.investor.address);
        console.log("Strategy: ", strategy);
        console.log("Info: ", this.adapterInfo.address);
        console.log("SushiSwapFarmLPAdapter: ", this.adapter.address);
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
                await this.adapter.userAdapterInfos(this.aliceAddr, 1)
            ).invested;
            expect(Number(aliceInfo) / Math.pow(10, 18)).to.eq(10);

            const aliceAdapterInfos = await this.adapter.userAdapterInfos(
                this.aliceAddr,
                1
            );
            const adapterInfos = await this.adapter.adapterInfos(1);
            expect(BigNumber.from(adapterInfos.totalStaked)).to.eq(
                BigNumber.from(aliceAdapterInfos.amount)
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
                await this.adapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;
            expect(Number(bobInfo) / Math.pow(10, 18)).to.eq(20);

            const bobAdapterInfos = await this.adapter.userAdapterInfos(
                this.bobAddr,
                1
            );
            expect(BigNumber.from(bobAdapterInfos.amount).gt(0)).to.eq(true);

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
        });

        it("(5) test claim, pendingReward function and protocol-fee", async function () {
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

            expect(pending).to.be.within(
                actualPending,
                actualPending.add(BigNumber.from(4e14))
            ) &&
                expect(protocolFee).to.be.within(
                    actualPending.mul(this.performanceFee).div(1e4),
                    actualPending
                        .add(BigNumber.from(4e14))
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
                this.owner.address
            );
            let aliceInfo = (
                await this.adapter.userAdapterInfos(this.aliceAddr, 1)
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
            }

            aliceInfo = (await this.adapter.userAdapterInfos(this.aliceAddr, 1))
                .invested;
            expect(aliceInfo).to.eq(BigNumber.from(0));

            const bobInfo = (
                await this.adapter.userAdapterInfos(this.bobAddr, 1)
            ).invested;
            const bobDeposit = Number(bobInfo) / Math.pow(10, 18);
            expect(bobDeposit).to.eq(20);

            expect(
                BigNumber.from(
                    (await this.adapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
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
            await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
            await ethers.provider.send("evm_mine", []);

            // withdraw from nftId: 1
            const beforeETH = await ethers.provider.getBalance(this.bobAddr);
            const beforeOwnerETH = await ethers.provider.getBalance(
                this.owner.address
            );
            let bobInfo = (await this.adapter.userAdapterInfos(this.bobAddr, 1))
                .invested;

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
            }

            bobInfo = (await this.adapter.userAdapterInfos(this.bobAddr, 1))
                .invested;
            expect(bobInfo).to.eq(BigNumber.from(0));

            // Check accTokenPerShare Info
            expect(
                BigNumber.from(
                    (await this.adapter.adapterInfos(1)).accTokenPerShare
                ).gt(BigNumber.from(this.accTokenPerShare))
            ).to.eq(true);

            this.accTokenPerShare = (
                await this.adapter.adapterInfos(1)
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
