require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat");
require("dotenv-extended").load();

if (!process.env.TESTNET_PRIVKEY) throw new Error("TESTNET_PRIVKEY missing from .env file");
if (!process.env.MAINNET_PRIVKEY) throw new Error("MAINNET_PRIVKEY missing from .env file");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      forking: {
        url: "https://bsc-dataseed1.binance.org/",
        enabled: true,
        // blockNumber: 19717000,
      },
    },
    local: {
      url: "http://localhost:7545",
      chainId: 1337,
      gasPrice: 20000000000,
      gas: 2100000,
      accounts: [process.env.LOCAL_PRIVKEY],
    },
    mainnet: {
      chainId: 1,
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_MAINNET_KEY}`,
      accounts: [process.env.MAINNET_PRIVKEY],
    },
    rinkeby: {
      chainId: 3,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_TESTNET_KEY}`,
      gasPrice: 200000000000,
      accounts: [process.env.TESTNET_PRIVKEY],
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [process.env.MAINNET_PRIVKEY],
    },
    bscTestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: [process.env.TESTNET_PRIVKEY],
    },
  },
  etherscan: {
    // bnb network
    apiKey: process.env.BSCSCAN_API_KEY,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  mocha: {
    timeout: 20000000,
  },
  solidity: {
    compilers: [
      {
        version: "0.7.5",
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};
