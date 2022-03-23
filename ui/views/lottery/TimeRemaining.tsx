import React from 'react'
import { Box, Button, Flex, Text } from 'theme-ui'

import Countdown from 'react-countdown'

type Props = { drawTime?: number }

const TimeRemaining = (props: Props) => {
  // const { drawTime } = props

  const Completionist = () => <Button>Check Result</Button>

  const renderer = ({
    hours,
    minutes,
    seconds,
    completed,
  }: {
    hours: number
    minutes: number
    seconds: number
    completed: boolean
  }) => {
    const displayString =
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0') +
      ':' +
      seconds.toString().padStart(2, '0')

    if (completed) {
      // Render a completed state
      return <Completionist />
    } else {
      // Render a countdown
      return (
        <Flex
          css={{
            flexDirection: 'column',
            gap: '30px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Flex css={{ gap: '1rem' }}>
            <Text
              css={{
                fontFamily: 'Noto Sans',
                fontStyle: 'normal',
                fontWeight: 'bold',
                fontSize: '30px',
                lineHeight: '150%',
                textAlign: 'center',
                color: '#DF4886',
              }}
            >
              {displayString}
            </Text>
            <Text
              css={{
                fontFamily: 'Noto Sans',
                fontStyle: 'normal',
                fontWeight: 'bold',
                fontSize: '30px',
                lineHeight: '150%',
                textAlign: 'center',
                color: '#8E8DA0',
              }}
            >
              Until Next Draw
            </Text>
          </Flex>
        </Flex>
      )
    }
  }

  return (
    <Box p={3} css={{}}>
      <Flex css={{ alignItems: 'center', justifyContent: 'center' }}>
        <Countdown date={Date.now() + 5000000} renderer={renderer} />
      </Flex>
    </Box>
  )
}

export default TimeRemaining
