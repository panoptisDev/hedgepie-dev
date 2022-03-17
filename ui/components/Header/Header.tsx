import React from 'react'
import { useRouter } from 'next/router'
import { Image, NavLink } from 'theme-ui'
import styled from 'styled-components'
import NavBar from './NavBar'

type Props = {}

const Header = (props: Props) => {
  const router = useRouter()

  return (
    <HeaderContainer>
      <HeaderWrapper>
        <StyledLogoLink
          onClick={() => {
            router.push('/')
          }}
        >
          <Image src="./images/logo.png" alt="logo" />
        </StyledLogoLink>
        <NavBar />
      </HeaderWrapper>
    </HeaderContainer>
  )
}

const HeaderContainer = styled.div`
  background: #16103a;
`

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: auto;
  padding: 16px;
  justify-content: space-between;
`

const StyledLogoLink = styled(NavLink)`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 28px;
  color: #ffffff;
`

export default Header
