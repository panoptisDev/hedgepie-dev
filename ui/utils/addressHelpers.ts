import addresses from 'config/constants/contracts'
import { Address } from 'config/constants/types'

export const getAddress = (address: Address): string => {
  const mainNetChainId = 97
  const chainId = process.env.REACT_APP_CHAIN_ID
  return address[chainId] ? address[chainId] : address[mainNetChainId]
}

export const getHpieAddress = () => {
  return getAddress(addresses.hpie)
}

export const getMasterChefAddress = () => {
  return getAddress(addresses.masterChef)
}