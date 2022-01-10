require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat");
const keyConfig = require('./config/config.json');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    local: {
      url: "http://localhost:7545",
      chainId: 1337,
      gasPrice: 20000000000,
      gas: 2100000,
      accounts: [keyConfig.ganache, keyConfig.acc1, keyConfig.acc2]
    }
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  solidity: {
    compilers: [{
      version: "0.7.5",
    }]
  }
};
