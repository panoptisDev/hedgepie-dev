import { ethers } from 'ethers'

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

export const depositOnYBNFT = async (ybnftInvestorContract, account, ybnftId, token, amount) => {
  return ybnftInvestorContract.methods
    .deposit(account, ybnftId, token, amount)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const withdrawFromYBNFT = async (ybnftInvestorContract, account, ybnftId, token, amount) => {
  return ybnftInvestorContract.methods
    .withdraw(account, ybnftId, token, amount)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const fetchAdapters = async (adapterManagerContract) => {
  const adapters = await adapterManagerContract.methods.getAdapters().call()
  return adapters
}
