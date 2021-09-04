/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("@nomiclabs/hardhat-ethers");
 require("@nomiclabs/hardhat-solhint");
 
 module.exports = {
   solidity: "0.8.4",
   defaultNetwork: "hardhat",
   networks: {
     hardhat: {},
   }
 };