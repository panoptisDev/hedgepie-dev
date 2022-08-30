import React, { useState, useEffect, useCallback } from 'react'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { providers } from 'ethers'

import { JsonRpcProvider, StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { NETWORKS } from '../constants/constants'

const Web3Context = React.createContext({
  account: '',
  chainId: 0,
  onConnect: () => {},
})

let web3Modal
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    // network: 'mainnet', // optional
    cacheProvider: false, // optional
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        // options: {
        //   rpc: {
        //     56: NETWORKS[56].uri(),
        //     97: NETWORKS[97].uri(),
        //   },
        // },
        options: {
          infuraId: 'd7e0a2aab46645c981bdf3fb6d3b75a1', // required
        },
      },
    },
  })
}

const Web3ContextProvider = ({ children }) => {
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState(0)
  const [provider, setProvider] = useState<any>()

  const onConnect = async () => {
    web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: false, // optional
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          // options: {
          //   rpc: {
          //     56: NETWORKS[56].uri(),
          //     97: NETWORKS[97].uri(),
          //   },
          // },
          // options: {
          //   infuraId: 'd7e0a2aab46645c981bdf3fb6d3b75a1', // required
          // },

          options: {
            infuraId: 'd7e0a2aab46645c981bdf3fb6d3b75a1',
          },
        },
      },
    })

    const provider = await web3Modal.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const signer = web3Provider.getSigner()
    const address = await signer.getAddress()
    const network = await web3Provider.getNetwork()

    // store data
    setAccount(address)
    setChainId(network.chainId)
    setProvider(provider)
  }

  const disconnect = useCallback(async () => {
    await web3Modal.clearCachedProvider()
    if (provider?.disconnect && typeof provider.disconnect === 'function') {
      await provider.disconnect()
    }
    setAccount('')
    setChainId(0)
  }, [provider])

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('changed account:', accounts[0])
        setAccount(accounts[0])
      }

      const handleChainChanged = (_hexChainId: string) => {
        console.log('changed chainId:', _hexChainId)
        window.location.reload()
      }

      const handleDisconnect = (error: { code: number; message: string }) => {
        disconnect()
      }

      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)
      provider.on('disconnect', handleDisconnect)

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged)
          provider.removeListener('chainChanged', handleChainChanged)
          provider.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [provider, disconnect])

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        onConnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export { Web3Context, Web3ContextProvider }
