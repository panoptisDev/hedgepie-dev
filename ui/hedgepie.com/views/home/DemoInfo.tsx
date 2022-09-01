import React from 'react'
import { Box, Image, Button, Link as ThemeLink } from 'theme-ui'
import { ArrowRight } from 'react-feather'

import { styles } from './styles'
import Link from 'next/link'
import toast from 'utils/toast'

const DemoInfo = () => {
  return (
    <Box
      id="demo-info"
      sx={{
        background:
          'linear-gradient(18deg, #1799DE 0%, rgba(25, 158, 230, 0.15) 14.56%, rgba(223, 72, 134, 0.15) 82.61%)',
        backdropFilter: 'blur(200px)',
        paddingTop: '50px',
        paddingBottom: '10px',
        boxShadow: ' 0px -4px 3px rgba(223, 72, 134, 0.15)',
      }}
    >
      <Box
        sx={{
          padding: '0 16px',
          marginTop: 60,
          marginBottom: 150,
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
              flexDirection: ['column', 'column', 'row'],
              marginBottom: 50,
              '& > *': {
                flex: 1,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: ['100%', '100%', 500],
                paddingBottom: '10px',
                height: 500,
              }}
            >
              <Image src="/images/macbook.svg" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: ['100%', '100%', '20rem'],
              }}
            >
              <Box
                sx={{
                  color: '#14114B',
                  fontSize: [30, 60],
                  fontWeight: 700,
                }}
              >
                Stake with the Best.
              </Box>
              <Box
                sx={{
                  color: '#8E8DA0',
                  marginTop: 16,
                  fontSize: [14, 20],
                }}
              >
                Take the guesswork out of staking. Th HedgePie Leaderboard displays top performing funds by APY. No
                longer do you need to know the ins and outs of every Crypto project to maintain your own portfolio.
                Simply pick a top performer and stake. Minimize your risk with clear historical data from custom index
                style funds created by experts
              </Box>
              <Box sx={{ marginTop: 50 }}>
                <Button
                  variant="primary"
                  sx={{
                    borderRadius: 40,
                    height: 64,
                    padding: '0 24px',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => toast('Our site will soon be live at hedgepie.finance')}
                >
                  <Box mr={2}>
                    <ThemeLink mr={4}>OPEN APP</ThemeLink>
                  </Box>
                  <ArrowRight />
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '100px' }}>
            {/* <Image src="/images/coinsfalling.svg" sx={{ marginLeft: '-1000px', width: '400px' }} /> */}
            <Image src="/images/nftcard.svg" />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: ['column', 'column', 'row'],
              marginBottom: 50,
              '& > *': {
                flex: 1,
              },
              marginTop: '100px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: ['100%', '100%', '20rem'],
              }}
            >
              <Box
                sx={{
                  color: '#14114B',
                  fontSize: [30, 60],
                  fontWeight: 700,
                }}
              >
                Your Fund. <br></br>Your Profit.
              </Box>
              <Box
                sx={{
                  color: '#8E8DA0',
                  marginTop: 16,
                  fontSize: [14, 20],
                }}
              >
                At Hedge Pie, users earn higher returns on already winning assets by combining them together into a fund
                that others can invest in. Choose your stake positions, set your fees, & earn. Top performing funds are
                tracked on the Hedge Pie leaderboard, so when funds perform well, investors follow. Think you have what
                it takes? Connect your wallet, choose your stake positions, & start earning.
              </Box>
              <Box sx={{ marginTop: 50 }}>
                <Button
                  variant="primary"
                  sx={{
                    borderRadius: 40,
                    height: 64,
                    padding: '0 24px',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => toast('Our site will soon be live at hedgepie.finance')}
                >
                  <Box mr={2}>
                    <ThemeLink mr={4}>OPEN APP</ThemeLink>
                  </Box>
                  <ArrowRight />
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: ['100%', '100%', 500],
                height: 500,
              }}
            >
              <Image src="/images/piebear.png" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DemoInfo
