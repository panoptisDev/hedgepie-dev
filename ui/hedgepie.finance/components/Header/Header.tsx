import React, { useEffect } from 'react'
import Link from 'next/link'
import { Box, Image, Link as ThemeLink, Button, ThemeUICSSObject } from 'theme-ui'
import { ArrowRight, Menu as MenuIcon } from 'react-feather'
import { Menu, MenuItem, MenuDivider } from '@szhsin/react-menu'
import { IoWalletOutline, IoWalletSharp } from 'react-icons/io5'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'
import { ConnectWallet } from 'components/ConnectWallet'
import { styles } from './styles'
import { useWeb3React } from '@web3-react/core'
import useWalletModal from 'widgets/WalletModal/useWalletModal'
import useAuth from 'hooks/useAuth'
import { connectorLocalStorageKey, ConnectorNames } from 'widgets/WalletModal'

type Props = {
  overlay?: boolean
  dark?: boolean
}

const MobileMenuLink = ({ href, children }) => (
  <Link href={href} passHref>
    <ThemeLink sx={styles.mobile_menu_link as ThemeUICSSObject}>{children}</ThemeLink>
  </Link>
)

const Header = ({ overlay = false, dark = true }: Props) => {
  const { login, logout } = useAuth()
  const { account, chainId } = useWeb3React()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  useEffect(() => {
    let key = window.localStorage.getItem(connectorLocalStorageKey) as ConnectorNames
    if (key) {
      login(key)
    }
  }, [])

  return (
    <Box
      className="header"
      sx={{
        px: 3,
        position: overlay ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: dark ? '#16103A' : 'transparent',
        color: dark ? '#FFF' : '#000',
        paddingRight: [0, 0, 10],
      }}
    >
      <Box sx={styles.header_inner_container as ThemeUICSSObject}>
        <Link href="/">
          <ThemeLink className="logo" mr={4} sx={{ ':hover': { cursor: 'pointer' } }}>
            <Image
              src="/images/logo.png"
              sx={{
                height: 60,
              }}
            />
          </ThemeLink>
        </Link>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ ...styles.navbar_container, color: dark ? '#fff' : '#14114B' } as ThemeUICSSObject}>
          {/* <Link href="/vault" passHref>
            <ThemeLink mr={4}>Vault</ThemeLink>
          </Link> */}
          {/* <Box marginRight={'40px'}>
            <a target="_blank" href="/HedgePie-Whitepaper-V5.pdf">
              <ThemeLink sx={{ '&:hover': { backgroundColor: '#417e96' }, padding: '5px 8px', borderRadius: '10px' }}>
                White Paper
              </ThemeLink>
            </a>
          </Box>

          <Link href="/v2/dashboard" passHref>
            <ThemeLink
              sx={{ '&:hover': { backgroundColor: '#417e96' }, padding: '5px 8px', borderRadius: '10px' }}
              mr={4}
            >
              Dashboard
            </ThemeLink>
          </Link>

          <Link href="/nft-leaderboard" passHref>
            <ThemeLink
              sx={{ '&:hover': { backgroundColor: '#417e96' }, padding: '5px 8px', borderRadius: '10px' }}
              mr={4}
            >
              Leaderboard
            </ThemeLink>
          </Link>

          <Box>
            <Link href="/mint" passHref>
              <ThemeLink
                sx={{ '&:hover': { backgroundColor: '#417e96' }, padding: '5px 8px', borderRadius: '10px' }}
                mr={4}
              >
                Mint
              </ThemeLink>
            </Link>
          </Box> */}
          <Box sx={styles.connect_wallet_btn_container as ThemeUICSSObject}>
            <ConnectWallet isHeaderBtn dark={dark} />
          </Box>
        </Box>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0px',
            marginLeft: 'auto',
            marginRight: '1px',
            width: 'max-content',
          }}
        >
          {/* <Menu
            menuButton={
              <Box sx={styles.mobile_menu_btn as ThemeUICSSObject}>
                <MenuIcon />
              </Box>
            }
            align="end"
            transition
            arrow
          >
            <MobileMenuLink href="/v2/dashboard">Dashboard</MobileMenuLink>
            <MobileMenuLink href="/nft-leaderboard">Leaderboard</MobileMenuLink>
            <MobileMenuLink href="/mint">Mint</MobileMenuLink>
            <MobileMenuLink href="/HedgePie-Whitepaper-V5.pdf">White Paper</MobileMenuLink>
          </Menu> */}
          <Box sx={styles.mobile_menu_connect_wallet as ThemeUICSSObject}>
            <Box
              mr={2}
              onClick={() => {
                if (account) return
                onPresentConnectModal()
              }}
            >
              {!account ? (
                <IoWalletOutline style={{ width: 40, height: 40 }} />
              ) : (
                <IoWalletSharp style={{ width: 40, height: 40 }} />
              )}
            </Box>
          </Box>
        </div>
      </Box>
    </Box>
  )
}

export default Header
