import BigNumber from 'bignumber.js'

export interface Address {
  256?: string
  128?: string
  43113?: string
  43114: string
}

export type TranslatableText =
  | string
  | {
    id: number
    fallback: string
    data?: {
      [key: string]: string | number
    }
  }


export interface Pool {
  pid: number
  lpToken: string
  allocPoint?: number
  totalStaked?: BigNumber
  dailyApr?: number
  apy?: BigNumber
  userData?: {
    pid?: number
    allowance: number
    stakingTokenBalance: BigNumber
    stakedBalance: BigNumber
    pendingReward: BigNumber
  }
}

export interface VaultState {
  poolLength?: number
  totalAllocPoint?: number
  rewardPerBlock?: number
  data: Pool[]
}

export interface State {
  vault: VaultState
}