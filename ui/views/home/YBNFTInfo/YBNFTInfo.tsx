import React from 'react'
import { Box, Image, Flex, Button } from 'theme-ui'
import { ArrowRight } from 'react-feather'
import DrawCountdown from './DrawCountdown'
import StakeInfo from './StakeInfo'
import NftInfo from './NftInfo'
import StrategyComposition from './StrategyComposition'

const YBNFTInfo = () => {
  return (
    <Box
      sx={{
        height: 1300,
        background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(223,72,134,0.15) 25%, rgba(25,158,230,0.15) 75%, rgba(255,255,255,1) 100%)',
      }}
    >
      <DrawCountdown />
      <Box
        sx={{
          margin: '0 auto',
          width: 1200,
          position: 'relative'
        }}
      >
        <Image
          src="/images/coins-2.png"
          sx={{
            position: 'absolute',
            top: 140,
            left: -200,
            width: 450
          }}
        />
        <Box
          sx={{
            marginTop: 32,
            position: 'relative',
            backgroundColor: '#fff',
            borderRadius: 50,
            padding: 64
          }}
        >
          <Flex>
            <StakeInfo />
            <Box pl={3} sx={{ flexGrow: 1 }}>
              <NftInfo />
              <StrategyComposition mt={40} />
            </Box>
          </Flex>
          <Box
            sx={{
              marginTop: 52,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Button
              variant="primary"
              sx={{
                borderRadius: 40,
                height: 64,
                padding: '0 40px',
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
  )
}

export default YBNFTInfo