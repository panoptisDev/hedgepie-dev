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

export const getHpieLpAddress = () => {
  return getAddress(addresses.hpieLp)
}

export const getMasterChefAddress = () => {
  return getAddress(addresses.masterChef)
}

export const getMulticallAddress = () => {
  return getAddress(addresses.mulltiCall)
}

export const getTokenName = (address: string) => {
  if (address.toLowerCase() === getHpieAddress().toLowerCase()) return 'HPIE'
  if (address.toLowerCase() === getHpieLpAddress().toLowerCase()) return 'HPIE-LP'
  return 'Unknown'
}