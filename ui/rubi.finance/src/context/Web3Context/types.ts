import Web3 from 'web3'

export interface IWeb3Context {
  web3?: Web3
  hasPerm?: boolean
  setWeb3?: (web3: Web3) => void
  requestAccess?: () => Promise<any>
  deposit?: () => void
}