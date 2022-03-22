/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Box } from 'theme-ui'

const Details: NextPage = () => {
  return (
    <HedgePieFinance>
      <Box
        sx={{
          minHeight: 600,
          padding: 90
        }}
      >
        Coming Soon
      </Box>
    </HedgePieFinance>
  )
}

export default Details
