/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: {
    version: '0.8.4',
    docker: false,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
