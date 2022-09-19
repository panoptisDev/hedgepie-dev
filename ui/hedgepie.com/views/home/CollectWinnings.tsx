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
        marginBottom: 20,
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
            gap: ['10px', '10px', '100px'],
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
                padding: ['3%', '5%', '15%'],
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
                <ThemeLink mr={4}>Investment Farming</ThemeLink>
              </Box>
            </Box>
            <Box
              sx={{
                color: '#8E8DA0',
                marginTop: 16,
                fontSize: [14, 14, 20],
              }}
            >
              Not interested in creating your own investment pool? Don’t worry; HedgePie has something for you too.
              Investment farming with HedgePie lets you invest in the pools already created by these expert investors.
              So, you, too, can earn by putting your funds into these pools. By putting your cryptocurrency funds into
              these pools already created and tested by expert investors, you get to earn the yields for the strategy
              without worrying too hard about the details. <br />
              All these and many more are waiting for you at HedgePie. Don't wait any longer.
            </Box>
            <Box sx={{ marginTop: [30, 30, 50] }}>
              <Button
                variant="info"
                sx={{
                  borderRadius: 40,
                  height: [40, 50, 64],
                  width: 'max-content',
                  padding: ['0 20px', '0 20px', '0 24px'],
                  cursor: 'pointer',
                  transition: 'all .2s',
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #1799DE',
                }}
              >
                <a href="https://hedgepie.finance" target="_blank">
                  <Box sx={{ fontSize: [14, 14, 20] }}>OPEN APP</Box>
                </a>
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CollectWinnings
