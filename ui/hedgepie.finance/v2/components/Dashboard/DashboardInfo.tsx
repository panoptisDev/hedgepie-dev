import React from 'react'
import { Box, Text } from 'theme-ui'
import DashboardFunds from './DashboardFunds'
import DashboardInvestments from './DashboardInvestments'
import DashboardOverview from './DashboardOverview'
import DashboardYieldStakeInfo from './DashboardYieldStakeInfo'

function DashboardInfo() {
  return (
    <Box sx={{ margin: '2rem 3rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <DashboardOverview />
      <DashboardFunds />
      <DashboardInvestments />
      <DashboardYieldStakeInfo />
    </Box>
  )
}

export default DashboardInfo
