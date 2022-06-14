
export const masterChefArgs = {
  lp: "0x3CdFF37d36278e13e1f68f6A0faECcDaB699E264", // HPIE token address
  rewardToken: "0x3CdFF37d36278e13e1f68f6A0faECcDaB699E264", // HPIE token address
  rewardPerBlock: "5000000000000000000", // 5 per block
  rewardHolder: "0x61B2E3aC6E5d7712537ed0909eed1ee838b410D3"
};

export const mockBEP20Args = {
  name: "mock Test Token",
  symbol: "mTT",
  initialSupply: "100000000000000000000000000",
};

export const mockLPArgs = {
  name: "mock HPIE LP",
  symbol: "mLP",
  initialSupply: "100000000000000000000000000",
};

export const venusBUSDLendAdapterArgs = {
  strategy: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  stakingToken: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  repayToken: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  name: "Venus BUSD lend adapter",
};

export const pksGalStakeAdapterArgs = {
  strategy: "0xa5D57C5dca083a7051797920c78fb2b19564176B",
  stakingToken: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
  rewardToken: "0xe4Cc45Bb5DBDA06dB6183E8bf016569f40497Aa5",
  name: "PKS-STAKE-GAL-ADAPTER",
};

// apeswap LP adapter
export const apeswapLpAdapterArgs = {
  pid: 3,
  strategy: "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",  // MasterApe
  stakingToken: "0x51e6D27FA57373d8d4C256231241053a70Cb1d93", // Apeswap BUSD-WBNB LP
  rewardToken: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",  // Banana token
  router: "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7",  // Apeswap router
  name: "ApeSwap::BUSD-WBNB"
};

// autoFarm LP adapter
export const autoFarmAdapterArgs = {
  strategy: "0x0895196562C7868C5Be92459FaE7f877ED450452", // Autofarm masterchef
  vStrategy: "0xcFF7815e0e85a447b0C21C94D25434d1D0F718D1", // Autofarm WBNB-Cake strategy
  stakingToken: "0x0ed7e52944161450477ee417de9cd3a859b14fd0", // WBNB-Cake LP
  rewardToken: "0x0ed7e52944161450477ee417de9cd3a859b14fd0", // WBNB-Cake LP
  router: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PKS router
  name: "AutoFarm::WBNB-CAKE"
};



export const ybnftArgs = {}
