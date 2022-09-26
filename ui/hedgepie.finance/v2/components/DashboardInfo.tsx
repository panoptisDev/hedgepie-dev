import React from 'react'
import { Box, Text } from 'theme-ui'
import DashboardOverview from './DashboardOverview'

function DashboardInfo() {
  return (
    <Box sx={{ margin: '2rem 3rem', width: '100%' }}>
      <DashboardOverview />
    </Box>
  )
}

export default DashboardInfo
