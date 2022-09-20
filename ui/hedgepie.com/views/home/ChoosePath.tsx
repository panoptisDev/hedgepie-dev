import React from 'react'
import { Box, Image } from 'theme-ui'

import { styles } from './styles'

const ChoosePath = () => {
  return (
    <Box
      px={3}
      sx={{
        marginTop: 0,
        marginBottom: [50, 150],
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
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
            fontWeight: 700,
            textAlign: 'center',
            color: '#14114B',
            fontFamily: 'Noto Sans',
            letterSpacing: '-2px',
            fontSize: [40, 40, 40, 80],
          }}
        >
          Choose your path.
        </Box>
        <Box
          sx={{
            marginTop: 22,
            fontSize: 18,
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#0B4C6F',
            letterSpacing: 2,
            fontFamily: 'Poppins',
            fontWeight: '600',
          }}
        >
          get your piece of the pie
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 60,
            '& > *': {
              maxWidth: 380,
            },
          }}
        >
          <Box
            my={3}
            mx={[0, 2]}
            sx={{
              backgroundColor: '#F6FAFD',
              color: '#1799DE',
              padding: [12, 40],
              borderRadius: [30, 60],
              boxShadow: ['0px 6px 0px #1799DE', '0px 16px 0px #1799DE'],
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                height: 56,
              }}
            >
              <Image src="images/step1.svg" />
            </Box>
            <Box
              sx={{
                marginTop: 19,
                textAlign: 'center',
                fontSize: [18, 30],
                fontWeight: 700,
                fontFamily: 'Poppins',
              }}
            >
              <Box>Save Your Time</Box>
              {/* <Box>APY</Box> */}
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#0B4C6F',
              }}
            >
              Are you a new cryptocurrency investor trying to save time while getting the best investment options?
              You’re in the right place.
              <br />
              HedgePie provides direct access to top strategies and investment pools from expert traders. Invest in a
              collection of DeFi strategies designed and curated by experienced DeFi investors. You only pay a
              performance fee when you gain profit.
            </Box>
          </Box>
          <Box
            my={3}
            mx={[0, 2]}
            sx={{
              backgroundColor: '#FFFBF4',
              color: '#EFA906',
              padding: [12, 40],
              borderRadius: [30, 60],
              boxShadow: ['0px 6px 0px #EFA906', '0px 16px 0px #EFA906'],
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                height: 56,
              }}
            >
              <Image src="images/step2.svg" />
            </Box>
            <Box
              sx={{
                marginTop: 19,
                textAlign: 'center',
                fontSize: [18, 30],
                fontWeight: 700,
                fontFamily: 'Poppins',
              }}
            >
              <Box>Join Other Investors</Box>
              {/* <Box>Fund</Box> */}
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#0B4C6F',
              }}
            >
              HedgePie features investment strategies from expert investors who use and trust the platform. Spanning
              across two networks and dozens of DeFi protocols, including Polygon, Uniswap, PanckeSwap, Venus, BNB
              Chain, and many others.
            </Box>
          </Box>
          <Box
            my={3}
            mx={[0, 2]}
            sx={{
              backgroundColor: '#F6FAFD',
              color: '#DF4886',
              padding: [12, 40],
              borderRadius: [30, 60],
              boxShadow: ['0px 6px 0px #DF4886', '0px 16px 0px #DF4886'],
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                height: 56,
              }}
            >
              <Image src="images/step3.svg" />
            </Box>
            <Box
              sx={{
                marginTop: 19,
                textAlign: 'center',
                fontSize: [18, 30],
                fontWeight: 700,
                fontFamily: 'Poppins',
              }}
            >
              <Box>Best Performing</Box>
              <Box>Strategies</Box>
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#16103A',
              }}
            >
              Stop guessing what options to stake with. HedgePie knows how hard it can be to decide the best investment
              choice. That's why the HedgePie leaderboard gives you a transparent list of high-performing investment
              funds. Choose from this leaderboard to minimize investment risks and maximize your profit.
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ChoosePath
