import React, { useCallback, useEffect, useState } from 'react'
import { Web3Provider } from 'context'
import Web3 from 'web3'
import { ERC20VaultABI, VAULT_ADDRESS } from 'abi/vault'
import { BigNumber } from 'bignumber.js'

interface IWeb3ContextProvider { }

export const Web3ContextProvider: React.FC<IWeb3ContextProvider> = ({
  children
}) => {
  const [web3, setWeb3] = useState<Web3>()
  const [hasPerm, setHasPerm] = useState(false)

  const init = useCallback(() => {
    if (window.ethereum) {
      setWeb3(new Web3(window.ethereum))
    } else if (window.web3) {
      setWeb3(new Web3(window.web3.currentProvider))
      setHasPerm(true)
    } else {
      console.log('metamask not detected')
    }
  }, [])

  useEffect(() => {
    init()
  }, [init])

  const requestAccess = async (): Promise<any> => {
    if (!web3) {
      init()
    }
    
    try {
      await window.ethereum.enable()
      setHasPerm(true)
      return Promise.resolve()
    } catch (error: any) {
      return Promise.reject(error)
    }
  }

  const deposit = async (value: string): Promise<any> => {
    if (!web3) {
      return
    }

    const vaultContract = new web3.eth.Contract(ERC20VaultABI, VAULT_ADDRESS)
    const amount = Web3.utils.toWei(value, 'ether')
    return vaultContract.methods.deposit(amount).send({
      // @ts-ignore
      from: web3.currentProvider.selectedAddress,
      gas: '99000'
    })
  }

  const getUserBalance = async (): Promise<any> => {
    if (!web3) {
      return
    }

    const vaultContract = new web3.eth.Contract(ERC20VaultABI, VAULT_ADDRESS)
    // @ts-ignore
    return vaultContract.methods.balanceOf(web3?.currentProvider?.selectedAddress).call()
  }

  return (
    <Web3Provider
      value={{
        web3,
        hasPerm,
        setWeb3,
        requestAccess,
        deposit,
        getUserBalance
      }}
    >
      {children}
    </Web3Provider>
  )
}
