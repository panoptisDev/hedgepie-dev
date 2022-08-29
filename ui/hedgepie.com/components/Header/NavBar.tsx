import React from 'react'
import { NavLink } from 'theme-ui'
import { useRouter } from 'next/router'
import { ConnectWallet } from 'components/ConnectWallet'
import styled from 'styled-components'

type Props = {}

const NavBar = (props: Props) => {
  const router = useRouter()

  return (
    <NavWrapper as="nav" css={{ alignItems: 'center' }}>
      <LinkWrapper>
        <StyledNavLink
          onClick={() => {
            router.push('/vault')
          }}
        >
          Vaults
        </StyledNavLink>
        <StyledNavLink
          onClick={() => {
            router.push('/nft-leaderboard')
          }}
        >
          Leaderboard
        </StyledNavLink>
        <StyledNavLink
          onClick={() => {
            router.push('/details')
          }}
        >
          Lottery
        </StyledNavLink>
        <StyledNavLink
          onClick={() => {
            router.push('/mint')
          }}
        >
          Mint
        </StyledNavLink>
      </LinkWrapper>
      <ConnectWalletWrapper>
        <ConnectWallet />
      </ConnectWalletWrapper>
    </NavWrapper>
  )
}

const NavWrapper = styled.div`
  display: flex;
  align-items: center;
`

const LinkWrapper = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 28px;
`

const StyledNavLink = styled(NavLink)`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 28px;
  color: #ffffff;
  margin-right: 40px;
`

const ConnectWalletWrapper = styled.div``

export default NavBar
