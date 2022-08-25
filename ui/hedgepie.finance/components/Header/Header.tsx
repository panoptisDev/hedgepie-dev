import React from 'react'
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
                height: 70,
              }}
            />
          </ThemeLink>
        </Link>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ ...styles.navbar_container, color: dark ? '#fff' : '#14114B' } as ThemeUICSSObject}>
          {/* <Link href="/vault" passHref>
            <ThemeLink mr={4}>Vault</ThemeLink>
          </Link> */}
          <Box marginRight={'40px'}>
            <a target="_blank" href="https://hedgepie.com/wp-content/uploads/2022/05/HedgePie-Whitepaper-V5.pdf">
              <ThemeLink>White Paper</ThemeLink>
            </a>
          </Box>
          <Link href="/nft-leaderboard" passHref>
            <ThemeLink mr={4}>Leaderboard</ThemeLink>
          </Link>
          <Link href="/mint" passHref>
            <ThemeLink mr={4}>Mint</ThemeLink>
          </Link>
          <Box sx={styles.connect_wallet_btn_container as ThemeUICSSObject}>
            <ConnectWallet isHeaderBtn dark={dark} />
          </Box>
        </Box>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0px', marginLeft: 'auto' }}>
          <Menu
            menuButton={
              <Box sx={styles.mobile_menu_btn as ThemeUICSSObject}>
                <MenuIcon />
              </Box>
            }
            align="end"
            transition
            arrow
          >
            {/* <MobileMenuLink href="/vault">Vault</MobileMenuLink> */}
            <MobileMenuLink href="/nft-leaderboard">Leaderboard</MobileMenuLink>
            <MobileMenuLink href="/mint">Mint</MobileMenuLink>
          </Menu>
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
