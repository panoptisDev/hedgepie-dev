import addresses from 'config/constants/contracts'
import { Address } from 'config/constants/types'

export const getAddress = (address: Address): string => {
  const mainNetChainId = 56
  const chainId = 97
  return address[chainId] ? address[chainId] : address[mainNetChainId]
}

export const getHpieAddress = () => {
  return getAddress(addresses.hpie)
}

export const getMasterChefAddress = () => {
  return getAddress(addresses.masterChef)
}