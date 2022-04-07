import React from 'react'
import styled from 'styled-components'
import useWalletModal from 'widgets/WalletModal/useWalletModal'
import useAuth from 'hooks/useAuth'

const UnlockButton = (props) => {
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  return (
    <button type="button" onClick={onPresentConnectModal} {...props}>
      {'Connect Wallet'}
    </button>
  )
}

export default UnlockButton
