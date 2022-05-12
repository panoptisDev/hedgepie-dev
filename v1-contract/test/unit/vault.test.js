const { ethers } = require("hardhat");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("Vault(MasterChef) contract test", () => {
    // accounts
    let deployer, account1, account2;
    let vaultContract;
    let mocklp;
    let mockToken;

    before(async () => {
        [deployer, account1, account2] = await ethers.getSigners();

        // prepare mock token and mock lp
        const MockLP = await ethers.getContractFactory("MockLP");
        mocklp = await MockLP.deploy("Mock LP", "mLP", utils.parseUnits("1000000"));
        await mocklp.deployed();
        console.log(`mock lp is deployed to ${mocklp.address}`);

        const MockToken = await ethers.getContractFactory("MockBEP20");
        mockToken = await MockToken.deploy("Mock Token", "mTT", utils.parseUnits("1000000"));
        await mockToken.deployed();
        console.log(`mock token is deployed to ${mockToken.address}`);

        // vault contract prepare
        const VaultContract = await ethers.getContractFactory("HedgepieMasterChef");
        vaultContract = await VaultContract.deploy(
            mocklp.address, // lp address
            mockToken.address, // reward token
            utils.parseUnits("4"), // block emission
            deployer.address // reward hodler
        );
        await vaultContract.deployed();
        console.log("vaultContract deployed to: " + vaultContract.address);

        // mint mock and lp token to user1
        await mocklp.connect(account1).mint(utils.parseUnits("10000"));
        await mockToken.connect(account1).mint(utils.parseUnits("10000"));

        // approve tokens first
        await mocklp.connect(deployer).approve(vaultContract.address, utils.parseUnits("1000000000"));
        await mockToken.connect(deployer).approve(vaultContract.address, utils.parseUnits("1000000000"));
        await mocklp.connect(account1).approve(vaultContract.address, utils.parseUnits("1000000000"));
        await mockToken.connect(account1).approve(vaultContract.address, utils.parseUnits("1000000000"));
        await mocklp.connect(account2).approve(vaultContract.address, utils.parseUnits("1000000000"));
        await mockToken.connect(account2).approve(vaultContract.address, utils.parseUnits("1000000000"));
    });

    describe("setting test", () => {
        it("pool length should be 1", async () => {
            const poolLength = Number(await vaultContract.poolLength());
            expect(poolLength).to.be.equal(1);
        });

        it("add pool can be called by only owner", async () => {
            await expect(vaultContract.connect(account1).add(1000, mocklp.address, false)).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );

            await vaultContract.connect(deployer).add(1000, mocklp.address, false);
        });

        it("pool length should be 2", async () => {
            const poolLength = Number(await vaultContract.poolLength());
            expect(poolLength).to.be.equal(2);
        });

        it("update pool[1] info by only owner", async () => {
            // current alloc value is 1000
            const poolInfo = await vaultContract.poolInfo(1);
            const allocValue = Number(poolInfo.allocPoint);
            expect(allocValue).to.be.equal(1000);

            // update alloc number to 2000
            await vaultContract.connect(deployer).set(1, 1500, true);

            // new alloc value should be 1500
            const newPoolInfo = await vaultContract.poolInfo(1);
            const newAllocValue = Number(newPoolInfo.allocPoint);
            expect(newAllocValue).to.be.equal(1500);
        });

        it("update multiplier", async () => {
            // can be called only owner
            await expect(vaultContract.connect(account1).updateMultiplier(2)).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );

            const beforeMultiplier = Number(await vaultContract.BONUS_MULTIPLIER());
            expect(beforeMultiplier).to.be.equal(1);

            await vaultContract.connect(deployer).updateMultiplier(2);

            const newMultiplier = Number(await vaultContract.BONUS_MULTIPLIER());
            expect(newMultiplier).to.be.equal(2);
        });
    });

    describe("deposit function test", () => {
        it("should be failed when caller has insufficient balance", async () => {
            await expect(vaultContract.connect(account2).deposit(0, utils.parseUnits("100"))).to.be.revertedWith(
                'BEP20: transfer amount exceeds balance'
            );
        });

        it("should be succeeded", async () => {
            await vaultContract.connect(account1).deposit(0, utils.parseUnits("100"));

            await vaultContract.connect(account1).deposit(0, utils.parseUnits("200"));

            await vaultContract.connect(account1).deposit(0, utils.parseUnits("300"));

            await vaultContract.connect(deployer).deposit(0, utils.parseUnits("500"));

            const userInfo = await vaultContract.userInfo(0, account1.address);
            const userAmount = Number(userInfo.amount) / Math.pow(10, 18);
            expect(userAmount).to.be.equal(600);
        });
    });

    describe("withdraw function test", () => {
        it("account2's pending reward should be zero", async () => {
            const pendingReward = Number(await vaultContract.pendingReward(0, account2.address));
            expect(pendingReward).to.be.equal(0);
        });

        it("account1's pending reward on pool 1 is also zero", async () => {
            const pendingReward = Number(await vaultContract.pendingReward(1, account1.address));
            expect(pendingReward).to.be.equal(0);
        });

        it("account1's pending reward on pool 0 should bigger than zero", async () => {
            const pendingReward = Number(await vaultContract.pendingReward(0, account1.address)) / Math.pow(10, 18);
            expect(pendingReward).to.be.gt(0);
        });

        it("can not withdraw bigger than current amount", async () => {
            await expect(vaultContract.connect(account1).withdraw(0, utils.parseUnits("10000"))).to.be.revertedWith(
                'withdraw: not good'
            );
        });

        it("withdraw should be successed", async () => {
            await vaultContract.connect(account1).withdraw(0, utils.parseUnits("1"));

            const userBalance = Number(await mockToken.balanceOf(account1.address)) / Math.pow(10, 18);
            expect(userBalance).to.be.gt(10000);
        });
    })
});
