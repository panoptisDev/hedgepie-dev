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
      alert(error?.message)
      return Promise.reject(error)
    }
  }

  const deposit = () => {
    if (!web3) {
      return
    }

    const vaultContract = new web3.eth.Contract(ERC20VaultABI, VAULT_ADDRESS)
    const amount = new BigNumber(314)
    vaultContract.methods.deposit(amount).send(
      {
        // @ts-ignore
        from: web3?.currentProvider?.selectedAddress
      }, (err: any, res: any) => {
      if (err) {
        console.log("An error occured", err)
        return
      }
      console.log("Hash of the transaction: " + res)
    })
  }

  return (
    <Web3Provider
      value={{
        web3,
        hasPerm,
        setWeb3,
        requestAccess,
        deposit
      }}
    >
      {children}
    </Web3Provider>
  )
}
