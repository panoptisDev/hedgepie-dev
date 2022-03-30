import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

export const approve = async (lpContract, masterChefContract, account) => {
    return lpContract.methods
        .approve(masterChefContract.options.address, ethers.constants.MaxUint256)
        .send({ from: account })
}


export const stakeOnMasterChef = async (masterChefContract, pid, amount, account) => {
    return masterChefContract.methods
        .deposit(pid, new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
        .send({ from: account })
        .on('transactionHash', (tx) => {
            return tx.transactionHash
        })
}

export const unstakeOnMasterChef = async (masterChefContract, pid, amount, account) => {
    return masterChefContract.methods
        .deposit(pid, new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
        .send({ from: account })
        .on('transactionHash', (tx) => {
            return tx.transactionHash
        })
}
