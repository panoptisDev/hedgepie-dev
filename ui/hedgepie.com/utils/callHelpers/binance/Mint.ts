import { ethers } from 'ethers'
import {  getYBNFTAddress } from '../../addressHelpers'

export const approveToken = async (tokenContract, masterChefContract, account) => {
  return tokenContract.methods
    .approve(masterChefContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}

export const stakeOnMasterChef = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .deposit(pid, amount.toString())
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const unstakeOnMasterChef = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .withdraw(pid, amount.toString())
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const mintYBNFT = async (
  ybnftMintContract,
  allocations,
  tokens,
  addresses,
  performanceFee,
  ipfsUrl,
  account,
) => {
  return ybnftMintContract.methods
    .mint(allocations, tokens, addresses, performanceFee, ipfsUrl)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}



export const fetchAdapters = async (adapterManagerContract) => {
  const adapters = await adapterManagerContract.methods.getAdapters().call()
  return adapters
}

export const fetchTokenAddress = async (adapterContract) => {
  const tokenAddress = await adapterContract.methods.stakingToken().call()
  return tokenAddress
}

export const fetchMaxTokenId = async (ybnftMintContract) => {
  const maxTokenId = await ybnftMintContract.methods.getCurrentTokenId().call()
  return maxTokenId
}

export const fetchTokenUri = async (ybnftMintContract, tokenId) => {
  const tokenUri = await ybnftMintContract.methods.tokenURI(tokenId).call()
  return tokenUri
}

export const fetchAllocations = async (ybnftMintContract, tokenId) => {
  const allocations = await ybnftMintContract.methods.getAdapterInfo(tokenId).call()
  return allocations
}


