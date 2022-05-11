const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('YBNFT contract test:', () => {
  // contracts
  let ybNftFactory;
  let ybNft;

  // accounts
  let account1;

  // constants
  const wbnb = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
  const strategy = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"

  // mint params
  const swapPercent = [10000];
  const swapToken = [wbnb];
  const strategyAddress = [strategy];
  const performanceFee = 50


  beforeEach(async () => {
    [deployer, owner, account1, account2] = await ethers.getSigners();

    // YBNFT contract prepare
    ybNftFactory = await ethers.getContractFactory('YBNFT');
    ybNft = await ybNftFactory.deploy();
    await ybNft.connect(deployer).transferOwnership(owner.address)
  });


  describe('mint function test', () => {
    it('should be failed when caller is not owner', async () => {
      await expect(ybNft.connect(account1).mint(swapPercent, swapToken, strategyAddress, performanceFee)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('should be failed when swapPercent is incorrect (over 10000)', async () => {
      await expect(ybNft.connect(owner).mint([10500], swapToken, strategyAddress, performanceFee)).to.be.revertedWith(
        'Incorrect swap percent'
      );
    });

    it('should be succeeded when caller is owner', async () => {
      await ybNft.connect(owner).mint(swapPercent, swapToken, strategyAddress, performanceFee);
    });

    it('should have Mint event when succeeded', async () => {
      const tx = await ybNft.connect(owner).mint(swapPercent, swapToken, strategyAddress, performanceFee);
      const { events } = await tx.wait()

      const mintEvent = events.find((x) => { return x.event == "Mint" });
      expect(mintEvent.event).to.be.equal("Mint")
    });

    it('should mint to owner', async () => {
      const tx = await ybNft.connect(owner).mint(swapPercent, swapToken, strategyAddress, performanceFee);
      expect(tx)
        .to.emit(ybNft, 'Mint')
        .withArgs(owner.address, 1)

      expect(await ybNft.ownerOf(1)).to.be.equal(owner.address);
    });

    it('should set stratigies data', async () => {
      await ybNft.connect(owner).mint(swapPercent, swapToken, strategyAddress, performanceFee);
      const nftStrategies = await ybNft.getStrategies(1)

      for (let index = 0; index < swapPercent.length; index++) {
        const stratigies = nftStrategies[index];
        expect(String(stratigies[0])).to.be.equal(String(swapPercent[index]))
        expect(stratigies[1]).to.be.equal(swapToken[index])
        expect(stratigies[2]).to.be.equal(strategyAddress[index])
      }
    });
  });
});
