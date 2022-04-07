import React from 'react'
import { Box, Button } from 'theme-ui'
import Countdown from 'react-countdown'

const DrawCountdown = () => (
  <Countdown
    date={Date.now() + 5000000}
    renderer={({ hours, minutes, seconds, completed }) => (
      <Box mt={32}>
        {completed ?
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Button>Check Result</Button>
          </Box>
          :
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: ['column', 'row'],
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: [30, 30, 50],
                fontWeight: 700,
                gap: [12, 24]
              }}
            >
              <Box
                sx={{
                  color: '#DF4886'
                }}
              >
                {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </Box>
              <Box
                sx={{
                  color: '#16103A',
                  textAlign: 'center'
                }}
              >
                Until Next Draw
              </Box>
            </Box>
            <Box
              sx={{
                textAlign: 'center',
                color: '#8E8DA0',
                fontSize: 19,
                fontWeight: 500,
                fontFamily: 'Poppins',
                marginTop: 16,
                letterSpacing: 3,
              }}
            >
              THERE&apos;S STILL TIME
            </Box>
          </>
        }
      </Box>
    )}
  />
)

export default DrawCountdown
