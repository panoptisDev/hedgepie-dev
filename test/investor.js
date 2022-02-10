const { ethers } = require("hardhat");
const { expect } = require("chai");
const { constants, utils } = require("ethers");


describe("Investor contract test:", () => {
  // accounts
  let deployer;
  let account1;

  let mockERC20; // mock erc20 token
  let hardhatMockERC20;

  beforeEach(async () => {
    [deployer, account1] = await ethers.getSigners();
  });

  describe("deposit function test", () => {
    it("should be succeeded", async () => {
    });
  });
});
