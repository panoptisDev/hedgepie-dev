import React from 'react'
import { Box, Image, Button, Link as ThemeLink } from 'theme-ui'
import { ArrowRight } from 'react-feather'

import { styles } from './styles'
import Link from 'next/link'
import toast from 'utils/toast'

const CollectWinnings = () => {
  return (
    <Box
      id="collect-winnings"
      sx={{
        padding: '0 16px',
        marginTop: 30,
        marginBottom: 0,
      }}
    >
      <Box
        sx={{
          margin: '0 auto',
          maxWidth: 1200,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: '100px',
            flexDirection: ['column-reverse', 'column-reverse', 'row'],
            '& > *': {
              flex: 1,
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image src="/images/cake-ring.png" />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                left: 0,
                width: '100%',
                height: '100%',
                padding: '15%',
              }}
            >
              <Image src="/images/logo-large.png" />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                color: '#16103A',
                fontSize: [30, 50],
                fontWeight: 700,
              }}
              onClick={() => toast('Our site will soon be live at hedgepie.finance')}
            >
              <Box mr={2}>
                <ThemeLink mr={4}>Collect Winnings</ThemeLink>
              </Box>
            </Box>
            <Box
              sx={{
                color: '#8E8DA0',
                marginTop: 16,
              }}
            >
              At Hedge Pie, users earn higher returns on already winning assets by combining them together into a fund
              that others can invest in. Choose your stake positions, set your fees, & earn. Top performing funds are
              tracked on the Hedge Pie leaderboard, so when funds perform well, investors follow. Think you have what it
              takes? Connect your wallet, choose your stake positions, & start earning.
            </Box>
            <Box sx={{ marginTop: 50 }}>
              <Button
                variant="info"
                sx={{
                  borderRadius: 40,
                  height: 64,
                  padding: '0 24px',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #1799DE',
                }}
                onClick={() => toast('Our site will soon be live at hedgepie.finance')}
              >
                <Box mr={2}>OPEN APP</Box>
                <ArrowRight />
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CollectWinnings
