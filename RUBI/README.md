RUBI Deployment Instructions
============================

Desc
----
RUBI is a fork of Pancakeswap's BUNNY and still includes all the BUNNY files in this repo. However, the deployment script only deploys some of these files. It's best to not interact with the contracts as much as possible and instead work with the deployment script, treating the proven BUNNY contracts as a bit of a black box. Unlike BUNNY, RUBI is updated to the latest compiler version of 0.8.0 however.

Seting up
---------
RUBI uses the hardhat smart contract framework. Install hardhat with npm using:  
`npm install --save-dev hardhat`

Installing dependancies
-----------------------
install npm packages using:  
`npm install`

Running tests
-------------
Run local tests with hardhat by running:  
`npx hardhat test`

Configuring for testnet deployments
-----------------------------------
Open the secrets.json file and fill out the necessary keys. This includes your private key for the deployer address, your infura api key and your etherscan api key (for contract verification)

Deploying to kovan
------------------
Run the following
`npx hardhat scripts/deploy.js --network kovan`
NOTE: This project has a heavy dependance on other projects in the BSC ecosystem. Because of that, a kovan deployment will likely not work. This makes live testnet deployments very tricky for RUBI and it may be better to test on mainnet BSC under a different token name. The easiest way to do this is probably by mass replacing RUBI with TEST.

Deploying to bsc
----------------
Run the following:
`npx hardhat scripts/deploy.js --network bscMain`
NOTE: Make sure the deployment address has some BSC for gas

Verifying contracts on ether/bscscan
------------------------------------
The etherscan api key can be gotten on etherscan by creating an account. Also you can get a bscscan api key in the same way. Note if you are deploying on bsc you will need to put your bscscan api key in the etherscan api key place in secrets.json.
Run the following to verify a contract:
`npx hardhat verify --network bscMain DEPLOYED_CONTRACT_ADDRESS`

NOTE: replace bscMain with kovan if deploying on kovan  

the deployed contract addresses will be listed when deploying.

More info on verification is here:  
https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html