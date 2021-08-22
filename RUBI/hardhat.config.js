/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const secrets = require("./secrets.json");

module.exports = {
  solidity: {
    version: '0.8.4',
    docker: false,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
    networks: {
      kovan: {
        url: `https://kovan.infura.io/v3/${secrets.api_key_infura}`,
        accounts: [`0x${secrets.deployment_private_key}`],
      },
    },
    bscMain: {
      url: `https://bsc-dataseed1.binance.org`,
      accounts: [`0x${secrets.deployment_private_key}`],
    },
    etherscan: {
      apiKey: secrets.api_key_etherscan
    },
  }
};
