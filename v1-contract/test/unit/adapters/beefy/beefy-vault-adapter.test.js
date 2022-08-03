const { expect } = require("chai");
const { ethers } = require("hardhat");

const ethVault = "0x725E14C3106EBf4778e01eA974e492f909029aE8";
const stakingToken = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const swapRouter = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
const wBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

describe("Beefy Vault Adapter Unit Test", function () {
  let beefyAdapter, hedgepieInvestor;
  let owner, alice;

  before("Deploy contract", async function () {
    [owner, alice] = await ethers.getSigners();

    console.log(owner.address, alice.address);

    // TODO: should add new code from here
    const BeefyAdapter = await ethers.getContractFactory("BeefyVaultAdapter");
    beefyAdapter = await BeefyAdapter.deploy(
      ethVault, 
      stakingToken,
      ethers.constants.AddressZero,
      "Beefy::EthAdapter"
    );
    await beefyAdapter.deployed();
    console.log(`Beefy Cake vault adapter deployed to: ${beefyAdapter.address}`);

    const YBNftContract = await ethers.getContractFactory("YBNFT");
    const ybnftContract = await YBNftContract.deploy();
    await ybnftContract.deployed();
    console.log(`ybnft Contract deployed to: ${ybnftContract.address}`);

    const HedgepieInvestor = await ethers.getContractFactory("HedgepieInvestor");
    hedgepieInvestor = await HedgepieInvestor.deploy(ybnftContract.address, swapRouter, wBNB);
    await hedgepieInvestor.deployed();
    console.log(`hedgepie investor deployed to: ${hedgepieInvestor.address}`);
  });

  describe("Testing set investor", () => {
    it("Set investor can be called by onlyowner", async() => {
      await expect(
        beefyAdapter.connect(alice).setInvestor(hedgepieInvestor.address)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    });

    it("Owner can set investor", async() => {
      await beefyAdapter.connect(owner).setInvestor(hedgepieInvestor.address);
    })
  });

  describe("getInvestCallData function test", () => {
    it("this will work", async() => {
      await beefyAdapter.connect(owner).setInvestor(owner.address);
      const calldata = await beefyAdapter.getInvestCallData(ethers.utils.parseUnits("100"));

      expect(calldata.to).equal(ethVault);
      expect(Number(calldata.value)).equal(0);
      expect(calldata.data).equal("0xb6b55f250000000000000000000000000000000000000000000000056bc75e2d63100000");
    });
  });

  describe("getDevestCallData function test", () => {
    it("this will work", async() => {
      const calldata = await beefyAdapter.getDevestCallData(ethers.utils.parseUnits("100"));

      expect(calldata.to).equal(ethVault);
      expect(Number(calldata.value)).equal(0);
      expect(calldata.data).equal("0x2e1a7d4d0000000000000000000000000000000000000000000000056bc75e2d63100000");
    });
  });
});