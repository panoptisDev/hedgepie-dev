/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Box } from 'theme-ui'

const Offline: NextPage = () => {
  return (
    <HedgePieFinance>
      <Box
        sx={{
          minHeight: 600,
          padding: 90,
        }}
      >
        You are currently Offline !!
      </Box>
    </HedgePieFinance>
  )
}

export default Offline
