// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  // RUBI
  const Rubi = await hre.ethers.getContractFactory("RubiToken");
  const rubi = await Rubi.deploy();

  await rubi.deployed();

  console.log("Rubi token deployed to:", rubi.address);

  // RUBI POOL
  const RubiPool = await hre.ethers.getContractFactory("RubiPool");
  const rubiPool = await RubiPool.deploy(rubi.address);

  await rubiPool.deployed();

  console.log("Rubi pool deployed to:", rubiPool.address);
  
  // RUBI MINTER
  const RubiMinter = await hre.ethers.getContractFactory("RubiMinterV2");
  const rubiMinter = await RubiMinter.deploy(rubi.address,rubiPool.address);

  await rubiMinter.deployed();

  console.log("Rubi minter deployed to:", rubiMinter.address);
  
  //RUBI FLIP-FLIP
  const Flip = await hre.ethers.getContractFactory("VaultFlipToFlip");
  const flip = await Flip.deploy();

  await flip.deployed();

  console.log("Rubi flip-flip deployed to:", flip.address);

  //Rubi bnb requres the Lp token
  //But can be deployed as is
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
