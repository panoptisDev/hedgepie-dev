import React from 'react'
import Link from 'next/link'
import { Box, Image, Link as ThemeLink, Button } from 'theme-ui'
import { ArrowRight, Menu as MenuIcon } from 'react-feather'
import {
  Menu,
  MenuItem,
  MenuDivider
} from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'
import { ConnectWallet } from 'components/ConnectWallet'

type Props = {
  overlay?: boolean
  dark?: boolean
}

const MobileMenuLink = ({ href, children }) => (
  <Link href={href} passHref>
    <ThemeLink
      sx={{
        display: 'block',
        width: '100%',
        padding: '6px 24px',
        transition: 'all .2s',
        '&:hover': {
          backgroundColor: '#0001'
        },
        '&:active': {
          backgroundColor: '#0002'
        }
      }}
    >
      {children}
    </ThemeLink>
  </Link>
)


const Header = ({ overlay = false, dark = true }: Props) => {
  return (
    <Box
      px={3}
      sx={{
        position: overlay ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: dark ? '#16103A' : 'transparent',
        color: dark ? '#FFF' : '#000',
      }}
    >
      <Box
        sx={{
          margin: '0 auto',
          maxWidth: 1200,
          height: 120,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Link href="/" passHref>
          <ThemeLink mr={4}>
            <Image
              src="/images/logo.png"
              sx={{
                height: 70,
              }}
            />
          </ThemeLink>
        </Link>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            display: ['none', 'flex'],
            alignItems: 'center',
          }}
        >
          <Link href="/vault" passHref>
            <ThemeLink mr={4}>Vault</ThemeLink>
          </Link>
          <Link href="/nft-leaderboard" passHref>
            <ThemeLink mr={4}>Leaderboard</ThemeLink>
          </Link>
          <Link href="/mint" passHref>
            <ThemeLink mr={4}>Mint</ThemeLink>
          </Link>
          <Box
            sx={{
              border: '1px solid #1799DE',
              borderRadius: 40,
              height: 64,
              cursor: 'pointer',
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ConnectWallet isHeaderBtn />
          </Box>
        </Box>
        <Menu
          menuButton={
            <Box
              sx={{
                border: '1px solid #1799DE',
                color: '#1799DE',
                borderRadius: 4,
                width: 64,
                height: 64,
                cursor: 'pointer',
                transition: 'all .2s',
                display: ['flex', 'none'],
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: '#1799DE11'
                }
              }}
            >
              <MenuIcon />
            </Box>
          }
          align="end"
          transition
          arrow
        >
          <MobileMenuLink href="/vault">
            Vault
          </MobileMenuLink>
          <MobileMenuLink href="/nft-leaderboard">
            Leaderboard
          </MobileMenuLink>
          <MobileMenuLink href="/mint">
            Mint
          </MobileMenuLink>
          <MenuDivider />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '6px 24px',
              transition: 'all .2s',
              cursor: 'pointer',
              color: '#1799DE',
              '&:hover': {
                backgroundColor: '#0001'
              },
              '&:active': {
                backgroundColor: '#0002'
              }
            }}
          >
            <Box mr={2}>
              Connect Wallet
            </Box>
            <ArrowRight />
          </Box>
        </Menu>
      </Box>
    </Box>
  )
}

export default Header
