import React, { useCallback, useEffect, useState } from 'react'
import { Web3Provider } from 'context'
import Web3 from 'web3'

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

  return (
    <Web3Provider
      value={{
        web3,
        hasPerm,
        setWeb3,
        requestAccess
      }}
    >
      {children}
    </Web3Provider>
  )
}
