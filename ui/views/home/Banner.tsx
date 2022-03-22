import React from 'react'
import Link from 'next/link'
import { Box, Image, Button, Link as ThemeLink } from 'theme-ui'
import { ArrowRight } from 'react-feather'

type Props = {}

const Banner = (props: Props) => {
  return (
    <Box
      sx={{
        height: 1000,
        marginBottom: 60,
        background: 'url(/images/home-banner.jpg)',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover'
      }}
    >
      <Box
        sx={{
          paddingTop: 360
        }}
      >
        <Box
          sx={{
            margin: '0 auto',
            width: 1200,
            position: 'relative'
          }}
        >
          <Image
            src="/images/homepage-coins.png"
            sx={{
              position: 'absolute',
              top: -140,
              right: 0,
              width: 450
            }}
          />
          <Image
            src="/images/pie.png"
            sx={{
              position: 'absolute',
              top: 0,
              right: 30,
              width: 500
            }}
          />
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                maxWidth: 562,
                fontSize: 110,
                fontWeight: 700,
                color: '#16103a',
                lineHeight: 1
              }}
            >
              Stake. Earn. Win.
            </Box>
            <Box
              sx={{
                marginTop: 5,
                fontSize: 24,
                fontWeight: 500,
                color: '#8e8da0',
                maxWidth: 665
              }}
            >
              Stake to earn rewards while entering for a chance to win the Jackpot!
            </Box>
            <Box sx={{ marginTop: 70 }}>
              <Button
                variant="primary"
                sx={{
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
      </Box>
    </Box>
  )
}

export default Banner
