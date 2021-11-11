export type View ='STAKED VAULTS'|'ALL VAULTS'|'NORMAL VAULTS'|'BURNING VAULTS'|'INACTIVE VAULTS'|'MY COLLECTION'
export interface IVaultTable {
  view?: View
}

export type Instrument = {
  name: string
  platform: string
  tvl: number
  markedStaked: number
  daily: number
  apy: number
  symbol: string
}
