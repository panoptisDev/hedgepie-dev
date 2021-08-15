const YBNFT = artifacts.require("YBNFT");
const RNG = artifacts.require("RNG");

module.exports = async function (deployer, networks, [dev, user1, user2, lottery, treasury]) {
  await deployer.deploy(RNG);
  const rng = await RNG.deployed();
  await deployer.deploy(YBNFT,treasury, lottery, rng.address, {from: dev});
};
