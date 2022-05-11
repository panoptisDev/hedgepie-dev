import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { BscConnector } from '@binance-chain/bsc-connector'
import { ConnectorNames } from 'widgets/WalletModal'
import Web3 from 'web3'
import chainParams from './chainParams'

const POLLING_INTERVAL = 12000
const chainId = parseInt(process.env.REACT_APP_CHAIN_ID || '97', 10)

const injected = new InjectedConnector({ supportedChainIds: [chainId] })

const walletconnect = new WalletConnectConnector({
  rpc: { [chainId]: chainParams?.[chainId]?.rpcUrls[0] },
  bridge: 'https://pancakeswap.bridge.walletconnect.org/',
  qrcode: true,
  // pollingInterval: POLLING_INTERVAL,
})

const walletlink = new WalletLinkConnector({
  url: chainParams?.[chainId]?.rpcUrls[0],
  appName: 'Hedgepie Finance',
  appLogoUrl: '/images/hpie-logo.png',
})

const bscConnector = new BscConnector({ supportedChainIds: [chainId] })

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.BSC]: bscConnector,
  [ConnectorNames.Coinbase]: walletlink,
}

export const getLibrary = (provider): Web3 => {
  return provider
}
