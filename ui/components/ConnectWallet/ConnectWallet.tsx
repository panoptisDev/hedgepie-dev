import React from 'react'
import styled from 'styled-components'
import useWalletModal from 'widgets/WalletModal/useWalletModal'
import useAuth from 'hooks/useAuth'

const ConnectWallet = (props) => {
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  return (
    <StyledButton type="button" onClick={onPresentConnectModal} {...props}>
      {'Connect Wallet'}
    </StyledButton>
  )
}

interface StyledButtonProps {
  width?: number
  height?: number
  borderRadius?: number
  color?: string
  fontSize?: number
}

const StyledButton = styled.button<StyledButtonProps>`
  width: ${({ width }) => (width ? `${width}px` : '240px')};
  height: ${({ height }) => (height ? `${height}px` : '60px')};
  border-radius: ${({ borderRadius }) => (borderRadius ? `${borderRadius}px` : '35px')};
  padding: 0px 20px;
  line-height: 48px;
  font-size: 16px;
  font-weight: 600;
  background-color: #1799de;
  color: #fff;
  cursor: pointer;
  &:hover {
    border: 2px solid rgb(157 83 182);
    color: rgb(157 83 182);
  }
  box-shadow: 0px 20px 40px 0px rgba(23, 153, 222, 0.2);
`

export { ConnectWallet }
