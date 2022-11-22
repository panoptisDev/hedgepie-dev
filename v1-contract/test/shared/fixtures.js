const { ethers } = require("hardhat");

async function investorFixture(
    adapter,
    treasuryAddr,
    stakingToken,
    performanceFee
) {
    // Deploy YBNFT contract
    const ybNftFactory = await ethers.getContractFactory("YBNFT");
    const ybNft = await ybNftFactory.deploy();
    await ybNft.deployed();

    // deploy adapterinfo
    const AdapterInfo = await ethers.getContractFactory(
        "HedgepieAdapterInfoEth"
    );
    const adapterInfo = await AdapterInfo.deploy();
    await adapterInfo.deployed();

    // set manager in adapterInfo
    await adapterInfo.setManager(adapter.address, true);

    // Deploy Investor contract
    const InvestorFactory = await ethers.getContractFactory(
        "HedgepieInvestorEth"
    );
    const investor = await InvestorFactory.deploy(
        ybNft.address,
        treasuryAddr,
        adapterInfo.address
    );
    await investor.deployed();

    // Deploy Adaptor Manager contract
    const AdapterManager = await ethers.getContractFactory(
        "HedgepieAdapterManagerEth"
    );
    const adapterManager = await AdapterManager.deploy();
    await adapterManager.deployed();

    // set investor
    await adapter.setInvestor(investor.address);

    // Mint NFTs
    // tokenID: 1
    await ybNft.mint(
        [10000],
        [stakingToken],
        [adapter.address],
        performanceFee,
        "test tokenURI1"
    );

    // tokenID: 2
    await ybNft.mint(
        [10000],
        [stakingToken],
        [adapter.address],
        performanceFee,
        "test tokenURI2"
    );

    // Add Adapter to AdapterManager
    await adapterManager.addAdapter(adapter.address);

    // Set investor in adapter manager
    await adapterManager.setInvestor(investor.address);

    // Set adapter manager in investor
    await investor.setAdapterManager(adapterManager.address);

    return [
        adapterInfo,
        investor,
        ybNft
    ];
}

async function adapterFixture(
    adapterName
) {
    // Deploy HedgepieLibraryEth contract
    const Lib = await ethers.getContractFactory("HedgepieLibraryEth");
    const lib = await Lib.deploy();

    const Adapter = await ethers.getContractFactory(
        adapterName,
        {
            libraries: {
                HedgepieLibraryEth: lib.address,
            },
        }
    );
    
    return Adapter;
}

module.exports = {
    adapterFixture,
    investorFixture
}
