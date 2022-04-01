import React from 'react'
import { Box, Image, Button } from 'theme-ui'
import { ArrowRight } from 'react-feather'

type Props = {}

const Banner = (props: Props) => {
  return (
    <Box
      px={3}
      sx={{
        height: 1000,
        marginBottom: 60,
        background: 'url(/images/home-banner.jpg)',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          paddingTop: [200, 200, 200, 360]
        }}
      >
        <Box
          sx={{
            margin: '0 auto',
            maxWidth: 1200,
            position: 'relative'
          }}
        >
          <Image
            src="/images/homepage-coins.png"
            sx={{
              position: 'absolute',
              top: [300, 300, 250, -140],
              right: [-40, 0, 40, 0],
              width: [250, 250, 300, 450]
            }}
          />
          <Image
            src="/images/pie.png"
            sx={{
              position: 'absolute',
              top: [400, 400, 350, 0],
              right: [0, 30],
              width: [300, 300, 400, 500],
            }}
          />
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                maxWidth: [260, 450, 450, 562],
                fontSize: [50, 80, 80, 110],
                fontWeight: 700,
                color: '#16103a',
                lineHeight: 1
              }}
            >
              Stake. Earn. Win.
            </Box>
            <Box
              sx={{
                marginTop: [4, 5],
                fontSize: [16, 24],
                fontWeight: 500,
                color: '#8e8da0',
                maxWidth: 665
              }}
            >
              Stake to earn rewards while entering for a chance to win the Jackpot!
            </Box>
            <Box sx={{ marginTop: [30, 70] }}>
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
