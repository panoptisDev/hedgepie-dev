import React from 'react'
import { Box, Image } from 'theme-ui'

import { styles } from './styles'

const ChoosePath = () => {
  return (
    <Box
      px={3}
      sx={{
        marginTop: 60,
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
            fontSize: 60,
            fontWeight: 700,
            textAlign: 'center',
            color: '#14114B',
            fontFamily: 'Noto Sans',
            letterSpacing: '-2px',
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
              <Box>Earn The Highest</Box>
              <Box>APY</Box>
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#0B4C6F',
              }}
            >
              Access the highest returns when you invest in funds that dominate the Hedge Pie leaderboard
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
              <Box>Create Your Own</Box>
              <Box>Fund</Box>
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#0B4C6F',
              }}
            >
              Earn more when you combine your assets into high-yielding funds that others can invest in
            </Box>
          </Box>
          {/* <Box
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
              <Box>Enter the</Box>
              <Box>Lottery</Box>
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#16103A',
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat turpis mauris nunc sit placerat
              ullamcorper v
            </Box>
            </Box>*/}
        </Box>
      </Box>
    </Box>
  )
}

export default ChoosePath
