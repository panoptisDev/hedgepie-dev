import React from 'react'
import { Box, Button, Spinner, ThemeUICSSObject } from 'theme-ui'

import { styles } from './styles'

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const testData = []

const LotteryLoad = ({ onLoad }: any) => {
  const [newData, setNewData] = React.useState(testData)
  const [loading, setLoading] = React.useState(false)

  const handleClick = async () => {
    setLoading(true)
    await delay(1000)
    onLoad(newData)
    setLoading(false)
  }

  return (
    <Box sx={styles.lottery_load_container as ThemeUICSSObject}>
      {loading ? (
        <Spinner />
      ) : (
        <Button variant="info" sx={styles.lottery_load_more_btn as ThemeUICSSObject} onClick={handleClick}>
          Load More
        </Button>
      )}
    </Box>
  )
}

export default LotteryLoad
