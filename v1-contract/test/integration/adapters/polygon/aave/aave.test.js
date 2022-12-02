const { expect } = require("chai");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber;

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

describe("AaveMarketV2Adapter Integration Test", function () {
    before("Deploy contract", async function () {
        await forkNetwork();
    });

    describe("depositMATIC function test", function () {
        it("(1)should be reverted when nft tokenId is invalid", async function () {});
    });
});
