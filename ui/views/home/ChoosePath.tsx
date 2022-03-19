import React from 'react'
import { Box, Image } from 'theme-ui'

const ChoosePath = () => {
  return (
    <Box
      sx={{
        marginTop: 60,
        marginBottom: 150
      }}
    >
      <Box
        sx={{
          margin: '0 auto',
          width: 1200,
        }}
      >
        <Box
          sx={{
            fontSize: 48,
            fontWeight: 700,
            textAlign: 'center'
          }}
        >
          Choose your path
        </Box>
        <Box
          sx={{
            marginTop: 22,
            fontSize: 18,
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#8E8DA0',
            letterSpacing: 2
          }}
        >
          get your piece of the pie
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 24,
            marginTop: 60,
            '& > *': {
              flex: 1
            }
          }}
        >
          <Box
            sx={{
              backgroundColor: '#F6FAFD',
              color: '#1799DE',
              padding: 40,
              borderRadius: 60,
              boxShadow: '0px 15px 0px #1799DE',
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                height: 56
              }}
            >
              <Image src="images/step1.svg" />
            </Box>
            <Box
              sx={{
                marginTop: 19,
                textAlign: 'center',
                fontSize: 30,
                fontWeight: 700
              }}
            >
              <Box>
                Eearn Up to XX%
              </Box>
              <Box>
                APY
              </Box>
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#16103A'
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat turpis mauris nunc sit placerat ullamcorper v
            </Box>
          </Box>
          <Box
            sx={{
              backgroundColor: '#F6FAFD',
              color: '#EFA906',
              padding: 40,
              borderRadius: 60,
              boxShadow: '0px 15px 0px #EFA906',
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                height: 56
              }}
            >
              <Image src="images/step2.svg" />
            </Box>
            <Box
              sx={{
                marginTop: 19,
                textAlign: 'center',
                fontSize: 30,
                fontWeight: 700
              }}
            >
              <Box>
                Create Your Own
              </Box>
              <Box>
                Fund
              </Box>
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#16103A'
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat turpis mauris nunc sit placerat ullamcorper v
            </Box>
          </Box>
          <Box
            sx={{
              backgroundColor: '#F6FAFD',
              color: '#DF4886',
              padding: 40,
              borderRadius: 60,
              boxShadow: '0px 15px 0px #DF4886',
            }}
          >
            <Box
              sx={{
                textAlign: 'center',
                height: 56
              }}
            >
              <Image src="images/step3.svg" />
            </Box>
            <Box
              sx={{
                marginTop: 19,
                textAlign: 'center',
                fontSize: 30,
                fontWeight: 700
              }}
            >
              <Box>
                Enter the
              </Box>
              <Box>
                Lottery
              </Box>
            </Box>
            <Box
              sx={{
                marginTop: 32,
                textAlign: 'center',
                color: '#16103A'
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec volutpat turpis mauris nunc sit placerat ullamcorper v
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ChoosePath