const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('YBNFT contract test:', () => {
  // contracts
  let ybNftFactory;
  let investorFactory;
  let lotteryFactory;
  let treasuryFactory;

  let ybNft;
  let investor;
  let lottery;
  let treasury;

  // accounts
  let account1;
  let account2;

  // constants
  const pancakeswapRouter = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"
  const wbnb = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"

  // swap params
  let swapPercent;
  // TODO: should be changed to token address
  let swapToken;
  let strategyAddress;

  let availableTokens = [wbnb];

  beforeEach(async () => {
    [deployer, owner, account1, account2] = await ethers.getSigners();

    // investor contract prepare
    investorFactory = await ethers.getContractFactory('HedgepieInvestor');
    investor = await investorFactory.deploy(
      pancakeswapRouter,
      wbnb
    );


    // YBNFT contract prepare
    ybNftFactory = await ethers.getContractFactory('YBNFT');
    ybNft = await ybNftFactory.deploy();
    await ybNft.connect(deployer).transferOwnership(owner.address)
    await ybNft.connect(owner).setInvestor(investor.address)

    // mint params
    swapPercent = [10000];
    // TODO: should be changed to token address
    swapToken = [investor.address];
    strategyAddress = [investor.address];
  });

  describe('setInvestor function test', () => {
    it('should be failed when caller is not owner', async () => {
      await expect(ybNft.connect(account1).setInvestor(investor.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('should be failed when investor address is zero address', async () => {
      await expect(ybNft.connect(owner).setInvestor(ethers.constants.AddressZero)).to.be.revertedWith(
        'Missing investor'
      );
    });

    it('should be succeeded when caller is owner', async () => {

      await ybNft.connect(owner).setInvestor(investor.address);
    });
  });

  describe('mint function test', () => {
    it('should be failed when caller is not owner', async () => {
      await expect(ybNft.connect(account1).mint(swapPercent, swapToken, strategyAddress)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('should be failed when swapPercent is incorrect (over 10000)', async () => {
      await expect(ybNft.connect(owner).mint([10500], swapToken, strategyAddress)).to.be.revertedWith(
        'Incorrect swap percent'
      );
    });

    it('should be succeeded when caller is owner', async () => {
      await ybNft.connect(owner).mint(swapPercent, swapToken, strategyAddress);
    });

    it('should have Mint event when succeeded', async () => {
      const tx = await ybNft.connect(owner).mint(swapPercent, swapToken, strategyAddress);
      const { events } = await tx.wait()

      const mintEvent = events.find((x) => { return x.event == "Mint" });

      expect(mintEvent.event).to.be.equal("Mint")
    });

    it('should mint to owner', async () => {
      const tx = await ybNft.connect(owner).mint(swapPercent, swapToken, strategyAddress);
      const { events } = await tx.wait()
      const { args } = events.find((x) => { return x.event == "Mint" });
      const tokenId = String(args[1])
      const nftOwner = String(await ybNft.ownerOf(tokenId))

      expect(nftOwner).to.be.equal(owner.address);
    });

    it('should set nftStrategy data', async () => {
      const tx = await ybNft.connect(owner).mint(swapPercent, swapToken, strategyAddress);
      const { events } = await tx.wait()
      const { args } = events.find((x) => { return x.event == "Mint" });

      const tokenId = String(args[1])
      const nftStrategies = await ybNft.getNftStrategy(tokenId)

      for (let index = 0; index < swapPercent.length; index++) {
        const nftStrategy = nftStrategies[index];

        expect(String(nftStrategy[0])).to.be.equal(String(swapPercent[index]))
        expect(nftStrategy[1]).to.be.equal(swapToken[index])
        expect(nftStrategy[2]).to.be.equal(strategyAddress[index])
      }
    });
  });

  describe('manageToken function test', () => {
    it('should be failed when caller is not owner', async () => {
      await expect(ybNft.connect(account1).manageToken(availableTokens, true)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });


    it('should be succeeded when caller is owner', async () => {
    });

    it('should be update allowedToken data', async () => {
      await ybNft.connect(owner).manageToken(availableTokens, true);

      const availableTokenStatus = await ybNft.allowedToken(availableTokens[0]);
      expect(availableTokenStatus).to.be.equal(true);
    });
  });
});
