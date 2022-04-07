import React from 'react'
import styled from 'styled-components'
import Flex from 'components/Flex/Flex'
import CopyToClipboard from 'widgets/WalletModal/CopyToClipboard'
import { useWalletModal } from 'widgets/WalletModal'
import { Login } from 'widgets/WalletModal/types'
import { connectorLocalStorageKey } from 'widgets/WalletModal/config'
import { ConnectWallet } from 'components/ConnectWallet'

interface Props {
  account?: string
  login: Login
  logout: () => void
}

const UserBlock: React.FC<Props> = ({ account, login, logout }) => {
  const { onPresentConnectModal } = useWalletModal(login, logout, account)
  const accountEllipsis = account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : null

  const renderAccountData = () => {
    return (
      <div>
        <CopyToClipboard toCopy={account || ''}>{accountEllipsis}</CopyToClipboard>
        <Flex justifyContent="center">
          <button
            type="button"
            onClick={() => {
              logout()
              window.localStorage.removeItem(connectorLocalStorageKey)
            }}
          >
            Logout
          </button>
        </Flex>
      </div>
    )
  }

  return (
    <div>
      {account ? (
        <div>
          <div>
            {accountEllipsis}
            {renderAccountData()}
          </div>
        </div>
      ) : (
        // <button
        //   type="button"
        //   onClick={() => {
        //     onPresentConnectModal()
        //   }}
        // >
        //   {'Connect Wallet'}
        // </button>
        <ConnectWallet />
      )}
    </div>
  )
}

export default UserBlock
