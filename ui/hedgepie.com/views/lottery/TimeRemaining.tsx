import React from 'react'
import { Box, Button, Flex, Text, ThemeUICSSObject } from 'theme-ui'

import Countdown from 'react-countdown'
import { styles } from './styles'

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
        <Flex sx={styles.time_remaining_container as ThemeUICSSObject}>
          <Flex sx={styles.time_remaining_text_container as ThemeUICSSObject}>
            <Text sx={styles.time_remaining_time_display_text as ThemeUICSSObject}>{displayString}</Text>
            <Text sx={styles.time_remaining_comment_text as ThemeUICSSObject}>Until Next Draw</Text>
          </Flex>
        </Flex>
      )
    }
  }

  return (
    <Box p={3}>
      <Flex sx={styles.time_remaining_outer_container as ThemeUICSSObject}>
        {/* 5000000 should be updated as per the actual time left */}
        <Countdown date={Date.now() + 5000000} renderer={renderer} />
      </Flex>
    </Box>
  )
}

export default TimeRemaining
