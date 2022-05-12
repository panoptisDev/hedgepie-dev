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
  const adapterAddr = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"

  // mint params
  const adapterAllocations = [10000];
  const adapterTokens = [wbnb];
  const adapterAddrs = [adapterAddr];
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
      await expect(ybNft.connect(account1).mint(adapterAllocations, adapterTokens, adapterAddrs, performanceFee)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('should be failed when adapterAllocations is incorrect (over 10000)', async () => {
      await expect(ybNft.connect(owner).mint([10500], adapterTokens, adapterAddrs, performanceFee)).to.be.revertedWith(
        'Incorrect adapter allocation'
      );
    });

    it('should be succeeded when caller is owner', async () => {
      await ybNft.connect(owner).mint(adapterAllocations, adapterTokens, adapterAddrs, performanceFee);
    });

    it('should have Mint event when succeeded', async () => {
      const tx = await ybNft.connect(owner).mint(adapterAllocations, adapterTokens, adapterAddrs, performanceFee);
      const { events } = await tx.wait()

      const mintEvent = events.find((x) => { return x.event == "Mint" });
      expect(mintEvent.event).to.be.equal("Mint")
    });

    it('should mint to owner', async () => {
      const tx = await ybNft.connect(owner).mint(adapterAllocations, adapterTokens, adapterAddrs, performanceFee);
      expect(tx)
        .to.emit(ybNft, 'Mint')
        .withArgs(owner.address, 1)

      expect(await ybNft.ownerOf(1)).to.be.equal(owner.address);
    });

    it('should set adapterInfo data', async () => {
      await ybNft.connect(owner).mint(adapterAllocations, adapterTokens, adapterAddrs, performanceFee);
      const adapterInfo = await ybNft.getAdapterInfo(1)

      for (let index = 0; index < adapterAllocations.length; index++) {
        const adapter = adapterInfo[index];
        expect(String(adapter[0])).to.be.equal(String(adapterAllocations[index]))
        expect(adapter[1]).to.be.equal(adapterTokens[index])
        expect(adapter[2]).to.be.equal(adapterAddrs[index])
      }
    });
  });
});
