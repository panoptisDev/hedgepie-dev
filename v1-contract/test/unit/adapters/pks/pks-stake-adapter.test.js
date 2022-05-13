const hre = require("hardhat");
const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");

const WHALE = "0x41772edd47d9ddf9ef848cdb34fe76143908c7ad";

const BigNumber = ethers.BigNumber;

const E18 = BigNumber.from(10).pow(18);

const unlockAccount = async (address) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return hre.ethers.provider.getSigner(address);
};

describe("Pancakeswap Farm Adapter Unit Test", function () {
  before("Deploy contract", async function () {
    const [owner, alice] = await ethers.getSigners();

    this.whaleWallet = await unlockAccount(WHALE);
    this.owner = owner;
    this.alice = alice;

    // TODO: should add new code from here
  });
});