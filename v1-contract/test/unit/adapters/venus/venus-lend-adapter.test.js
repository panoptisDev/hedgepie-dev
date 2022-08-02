const { assert, expect } = require("chai");
const { ethers } = require("hardhat");

describe("VenusAdapter Unit Test", function () {
  before("Deploy contract", async function () {
    const [owner, investor, alice] = await ethers.getSigners();

    this.alice = alice;
    this.owner = owner;
    this.investor = investor;
    this.strategy = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";

    // Deploy Venus Adapter contract
    const VenusAdapter = await ethers.getContractFactory("VenusLendAdapter");
    this.vAdapter = await VenusAdapter.deploy(
      this.strategy,
      this.investor.address
    );
    await this.vAdapter.deployed();

    console.log("Owner: ", this.owner.address);
    console.log("Investor: ", this.investor.address);
    console.log("Strategy: ", this.strategy);
    console.log("VenusAdapter: ", this.vAdapter.address);
  });

  describe("should set correct state variable", function () {
    it("(1) Check investor address", async function () {
      expect(await this.vAdapter.investor()).to.eq(this.investor.address);
    });

    it("(2) Check strategy address", async function () {
      expect(await this.vAdapter.strategy()).to.eq(this.strategy);
    });

    it("(3) Check owner wallet", async function () {
      expect(await this.vAdapter.owner()).to.eq(this.owner.address);
    });
  });

  describe("should get invest call data only from investor", function () {
    it("revert not from investor", async function () {
      await expect(
        this.vAdapter.connect(this.alice).getInvestCallData("0")
      ).to.be.revertedWith("Error: caller is not investor");
    });

    it("should get invest call data properly", async function () {
      const result = await this.vAdapter
        .connect(this.investor)
        .getInvestCallData("0");

      expect(!!result).to.eq(true);
    });
  });

  describe("should get devest call data only from investor", function () {
    it("revert not from investor", async function () {
      await expect(
        this.vAdapter.connect(this.alice).getDevestCallData("0")
      ).to.be.revertedWith("Error: caller is not investor");
    });

    it("should get devest call data properly", async function () {
      const result = await this.vAdapter
        .connect(this.investor)
        .getDevestCallData("0");

      expect(!!result).to.eq(true);
    });
  });

  describe("should set investor only from owner wallet", function () {
    it("revert when from owner wallet", async function () {
      await expect(
        this.vAdapter.connect(this.alice).setInvestor(this.owner.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("test the investor address correctly", async function () {
      await this.vAdapter.setInvestor(this.owner.address);

      expect(await this.vAdapter.investor()).to.eq(this.owner.address);
    });
  });
});
