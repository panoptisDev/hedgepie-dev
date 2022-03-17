import React from 'react'
import { connectorLocalStorageKey } from './config'
import { Login, Config } from './types'

interface Props {
  walletConfig: Config
  login: Login
  onDismiss: () => void
  mb: string
}

const WalletCard: React.FC<Props> = ({ login, walletConfig, onDismiss, mb }) => {
  const { title, icon: Icon } = walletConfig
  return (
    <button
      type="button"
      onClick={() => {
        login(walletConfig.connectorId)
        window.localStorage.setItem(connectorLocalStorageKey, walletConfig.connectorId)
        onDismiss()
      }}
      style={{ justifyContent: 'space-between' }}
      id={`wallet-connect-${title.toLocaleLowerCase()}`}
    >
      <div>{title}</div>
      <Icon width="32px" />
    </button>
  )
}

export default WalletCard
