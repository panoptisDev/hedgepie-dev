// ===== Apeswap Farm Lp Adapters
// apeswap farm adapter
export const apeswapFarmLpAdapterArgsList = {
  "ApeSwap::Farm::BUSD-WBNB": {
    pid: 3,
    strategy: "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9", // MasterApe
    stakingToken: "0x51e6D27FA57373d8d4C256231241053a70Cb1d93", // Apeswap BUSD-WBNB LP
    rewardToken: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95", // Banana token
    router: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7", // Apeswap router
    name: "ApeSwap::Farm::BUSD-WBNB",
  },
  "ApeSwap::Farm::ETH-WBNB": {
    pid: 5,
    strategy: "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9", // MasterApe
    stakingToken: "0xA0C3Ef24414ED9C9B456740128d8E63D016A9e11", //
    rewardToken: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95", // Banana token
    router: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7", // Apeswap router
    name: "ApeSwap::Farm::ETH-WBNB",
  },
  "ApeSwap::Farm::BANANA-BUSD": {
    pid: 2,
    strategy: "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9", // MasterApe
    stakingToken: "0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914", //
    rewardToken: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95", // Banana token
    router: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7", // Apeswap router
    name: "ApeSwap::Farm::BANANA-BUSD",
  },
};

// autoFarm vault adapter
export const autoFarmAdapterArgsList = {
  "AutoFarm::Vault::WBNB-CAKE": {
    strategy: "0x0895196562C7868C5Be92459FaE7f877ED450452", // Autofarm masterchef
    vStrategy: "0xcFF7815e0e85a447b0C21C94D25434d1D0F718D1", // Autofarm WBNB-Cake strategy
    stakingToken: "0x0ed7e52944161450477ee417de9cd3a859b14fd0", // WBNB-Cake LP
    rewardToken: "0x0ed7e52944161450477ee417de9cd3a859b14fd0", // WBNB-Cake LP
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PKS router
    name: "AutoFarm::Vault::WBNB-CAKE",
  },
  "AutoFarm::Vault::WBNB-BUSD": {
    strategy: "0x0895196562C7868C5Be92459FaE7f877ED450452", // Autofarm masterchef
    vStrategy: "0x06af474aa7fF6862ffF27a239459cc58d95884a8", // Autofarm WBNB-Cake strategy
    stakingToken: "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16", // WBNB-Cake LP
    rewardToken: "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16", // WBNB-Cake LP
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PKS router
    name: "AutoFarm::Vault::WBNB-BUSD",
  },
  "AutoFarm::Vault::ADA-WBNB": {
    strategy: "0x0895196562C7868C5Be92459FaE7f877ED450452", // Autofarm masterchef
    vStrategy: "0x302dD3ebB6D554E8D16A7E3eb2985E76Fe408FA8", // Autofarm WBNB-Cake strategy
    stakingToken: "0x28415ff2C35b65B9E5c7de82126b4015ab9d031F", // WBNB-Cake LP
    rewardToken: "0x28415ff2C35b65B9E5c7de82126b4015ab9d031F", // WBNB-Cake LP
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PKS router
    name: "AutoFarm::Vault::ADA-WBNB",
  },
};

// biswap farm adapter
export const biswapAdapterArgsList = {
  "Biswap::Farm::BSW": {
    poolId: 0,
    strategy: "0xDbc1A13490deeF9c3C12b44FE77b503c1B061739",
    vStrategy: "N/A",
    stakingToken: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    rewardToken: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    router: "0x0000000000000000000000000000000000000000",
    name: "Biswap::Farm::BSW",
  },
  "Biswap::Farm::USDT-BSW": {
    poolId: 9,
    strategy: "0xDbc1A13490deeF9c3C12b44FE77b503c1B061739",
    vStrategy: "N/A",
    stakingToken: "0x2b30c317ceDFb554Ec525F85E79538D59970BEb0",
    rewardToken: "0x965f527d9159dce6288a2219db51fc6eef120dd1",
    router: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
    name: "Biswap::Farm::USDT-BSW",
  },
};

// beefy farm adapter
export const beefyAdapterArgsList = {
  "Beefy::Vault::ETH": {
    strategy: "0x725E14C3106EBf4778e01eA974e492f909029aE8",
    stakingToken: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    router: "0x0000000000000000000000000000000000000000",
    name: "Beefy::Vault::ETH",
  },
  "Beefy::Vault::Biswap USDT-BUSD": {
    strategy: "0x164fb78cAf2730eFD63380c2a645c32eBa1C52bc",
    stakingToken: "0xDA8ceb724A06819c0A5cDb4304ea0cB27F8304cF",
    router: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
    name: "Beefy::Vault::Biswap USDT-BUSD",
  },
};
