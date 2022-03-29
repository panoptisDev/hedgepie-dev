import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Box, Image, Link as ThemeLink, Button } from 'theme-ui'
import { ArrowRight } from 'react-feather'

type Props = {
  overlay?: boolean
  dark?: boolean
}

const Header = ({ overlay = false, dark = true }: Props) => {
  const router = useRouter()

  return (
    <Box
      sx={{
        position: overlay ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: dark ? '#16103A' : 'transparent',
        color: dark ? '#FFF' : '#000'
      }}
    >
      <Box
        sx={{
          margin: '0 auto',
          width: 1200,
          height: 120,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Link href="/" passHref>
          <ThemeLink mr={4}>
            <Image
              src="/images/logo.png"
              sx={{
                height: 70
              }}
            />
          </ThemeLink>
        </Link>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Link href="/vault" passHref>
            <ThemeLink mr={4}>
              Vault
            </ThemeLink>
          </Link>
          <Link href="/nft-leaderboard" passHref>
            <ThemeLink mr={4}>
              Leaderboard
            </ThemeLink>
          </Link>
          <Link href="/mint" passHref>
            <ThemeLink mr={4}>
              Mint
            </ThemeLink>
          </Link>
          <Button
            variant="info"
            sx={{
              border: '1px solid #1799DE',
              borderRadius: 40,
              height: 64,
              padding: '0 24px',
              cursor: 'pointer',
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box mr={2}>
              Connect Wallet
            </Box>
            <ArrowRight />
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default Header
