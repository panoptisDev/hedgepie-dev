import React from 'react'
import { Box, Text } from 'theme-ui'
import DashboardFunds from './DashboardFunds'
import DashboardOverview from './DashboardOverview'

function DashboardInfo() {
  return (
    <Box sx={{ margin: '2rem 3rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <DashboardOverview />
      <DashboardFunds />
    </Box>
  )
}

export default DashboardInfo
