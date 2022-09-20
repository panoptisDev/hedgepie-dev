import React from 'react'
import { Box, Image, Button, Link as ThemeLink, Text } from 'theme-ui'
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
                Opt out anytime you want.
              </Box>
              <Box
                sx={{
                  color: '#8E8DA0',
                  marginTop: 16,
                  fontSize: [14, 14, 20],
                }}
              >
                Investment shouldn't be a do-or-die affair. That's why the liquidity of the investment pool is the way
                out for you. You can cash out from any investment strategy you try out at any time, and we will not
                charge any fees.
              </Box>
              <Box sx={{ marginTop: 50 }}>
                <Button
                  variant="primary"
                  sx={{
                    borderRadius: 40,
                    height: [40, 50, 64],
                    width: 'fit-content',
                    padding: ['0 20px', '0 20px', '0 24px'],
                    cursor: 'pointer',
                    transition: 'all .2s',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #1799DE',
                  }}
                >
                  <a href="https://hedgepie.finance" target="_blank">
                    <Text sx={{ paddingRight: '10px' }}>See how it works</Text>
                    {/* <ArrowRight /> */}
                  </a>
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
                DeFi and blockchain technology at its finest
              </Box>
              <Box
                sx={{
                  color: '#8E8DA0',
                  marginTop: 16,
                  fontSize: [14, 14, 20],
                }}
              >
                A brilliant team created HedgePie's structure to give new and expert investors a shot at having the best
                of both worlds. Built on the Binance Smart Chain network and polygon with more networks coming soon.
                HedgePie, the DeFi project, has diverse investment strategies and pools with its multi-chain feature,
                all for you. Exchange and invest in tokens across multiple blockchains with 0 added fees, all from a
                single portal that gives you complete visibility and access to your portfolio.
              </Box>
              <Box sx={{ marginTop: 50 }}>
                <Button
                  variant="primary"
                  sx={{
                    borderRadius: 40,
                    height: [40, 50, 64],
                    width: 'fit-content',
                    padding: ['0 20px', '0 20px', '0 24px'],
                    cursor: 'pointer',
                    transition: 'all .2s',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #1799DE',
                  }}
                >
                  <a href="https://hedgepie.finance" target="_blank">
                    <Text sx={{ paddingRight: '10px' }}>OPEN APP</Text>
                    {/* <ArrowRight /> */}
                  </a>
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: ['100%', '100%', 500],
                height: 500,
                marginBottom: ['-160px'],
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
