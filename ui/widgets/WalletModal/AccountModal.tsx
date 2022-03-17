import React from 'react'

import { Modal } from '../Modal'
import CopyToClipboard from './CopyToClipboard'
import { connectorLocalStorageKey } from './config'
import Flex from 'components/Flex/Flex'

interface Props {
  account: string
  logout: () => void
  onDismiss?: () => void
}

const AccountModal: React.FC<Props> = ({ account, logout, onDismiss = () => null }) => (
  <Modal title="Your wallet" onDismiss={onDismiss}>
    <div>{account}</div>
    <Flex mb="32px">
      <a href={`https://snowtrace.io/address/${account}`}>View on AvaxScan</a>
      <CopyToClipboard toCopy={account}>Copy Address</CopyToClipboard>
    </Flex>
    <Flex justifyContent="center">
      <button
        type="button"
        onClick={() => {
          logout()
          window.localStorage.removeItem(connectorLocalStorageKey)
          onDismiss()
        }}
      >
        Logout
      </button>
    </Flex>
  </Modal>
)

export default AccountModal
