const hre = require("hardhat");
const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");

const BUSD_TOKEN = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const vBUSD_TOKEN = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const WHALE = "0x41772edd47d9ddf9ef848cdb34fe76143908c7ad";
const REWARD_FEE = 500;

const BigNumber = ethers.BigNumber;

const E18 = BigNumber.from(10).pow(18);

const unlockAccount = async (address) => {
  await hre.network.provider.send("hardhat_impersonateAccount", [address]);
  return hre.ethers.provider.getSigner(address);
};

describe("Venus Lend Adapter Unit Test", function () {
  before("Deploy contract", async function () {
    const [owner, alice] = await ethers.getSigners();

    this.whaleWallet = await unlockAccount(WHALE);
    this.owner = owner;
    this.alice = alice;

    // TODO: should add new code from here
  });
});