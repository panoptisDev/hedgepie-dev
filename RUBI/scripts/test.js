const hre = require("hardhat");

async function getAccounts () {
  const accounts = await hre.ethers.getSigners();
  const accountsArr = []
  for (const account of accounts) {
    accountsArr.push(await account.address);
  }
  return accountsArr;
}


async function main() {
  // get accounts to tests
  const accounts = await getAccounts()


  // topic 1 - create a token called RUBI with governance features
  // deploy the contract
  const Rubi = await hre.ethers.getContractFactory("RubiToken");
  const rubi = await Rubi.deploy();

  await rubi.deployed();

  // deployment
  console.log("Rubi token deployed to:", rubi.address);

  // change governance delegation property - if necessary change the contact owner, call this
  const rubiContract = await ethers.getContractAt('RubiToken', rubi.address)

  const mint = await rubiContract.delegate(accounts[1]) // new owner
  console.log('Delegation transaction:', mint.hash)
  console.log("Delegated to:", accounts[1]);



  // topic 2 - create a lp token that auto compound
  // RUBI MINTER
  // deploy RubiPool, an dependency
  const RubiPool = await hre.ethers.getContractFactory("RubiPool");
  const rubiPool = await RubiPool.deploy(rubi.address);

  await rubiPool.deployed();

  // deploy the RUBI Minter, when Ruvi Pool is deployed
  const RubiMinter = await hre.ethers.getContractFactory("RubiMinterV2");
  const rubiMinter = await RubiMinter.deploy(rubi.address,rubiPool.address);

  console.log("Rubi minter deployed to:", rubiMinter.address);

  // get the contract to make transactions - you can see the other methods in the contract, i did not change a lot
  const rubiMinterContract = await ethers.getContractAt('RubiMinterV2', rubiMinter.address)
  
  // initialize minter
  await rubiMinterContract.initialize();

  // get withdrawal fee free period in seconds
  const withdrawlFeeFreePeriod = await rubiMinterContract.getWithdrawalFeeFreePeriod();
  console.log('Withdrawl Fee Free Period:', parseFloat(withdrawlFeeFreePeriod)/3600, 'hours') // convert seconds to hours
 
  // get withdrawl fee
  const withdrawlFee = await rubiMinterContract.withdrawalFee(1000, 1);
  console.log('Withdrawl Fee:', parseFloat(withdrawlFee)) // convert seconds to hours



  // topic 3 and 4 - get rewards of the pools
  // deploy the contract
  const VaultFlipToCake = await hre.ethers.getContractFactory("VaultFlipToCake");

  // deploy the contract where you can get rewards
  const vaultFlipToCake = await VaultFlipToCake.deploy();
  await vaultFlipToCake.deployed()

  console.log("VaultFlipToCake deployed to:", vaultFlipToCake.address);

  // create a contract instance 
  const vaultFlipToCakeContract = await ethers.getContractAt('VaultFlipToCake', vaultFlipToCake.address)

  const getRewardFlipToCakeTx = await vaultFlipToCakeContract.withdrawAll()

  // can be founded on this method, where the user call and get the rewards  
  console.log('withdrawl Rubi to:', getRewardFlipToCakeTx.from); // transaction sender
  console.log('withdrawl Rubi from:', getRewardFlipToCakeTx.to); // transaction vault



  const VaultFlipToFlip = await hre.ethers.getContractFactory("VaultFlipToFlip");

  // deploy the contract where you can get rewards
  const vaultFlipToFlip = await VaultFlipToFlip.deploy();
  await vaultFlipToFlip.deployed()

  console.log("VaultFlipToFlip deployed to:", vaultFlipToFlip.address);

  // create a contract instance 
  const vaultFlipToFlipContract = await ethers.getContractAt('VaultFlipToCake', vaultFlipToCake.address)

  const getRewardFlipToFlipx = await vaultFlipToFlipContract.withdrawAll()

  // can be founded on this method, where the user call and get the rewards  
  console.log('withdrawl RubiBNB to:', getRewardFlipToFlipx.from); // transaction sender
  console.log('withdrawl RubiBNB from:', getRewardFlipToFlipx.to); // transaction vault
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
