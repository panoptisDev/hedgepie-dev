import React from 'react'
import { Box } from 'theme-ui'
import StrategyCharts from './StrategyCharts'
import StrategyComposition from './StrategyComposition'
import StrategyOverview from './StrategyOverview'

function StrategyInfo() {
  return (
    <Box sx={{ margin: '2rem 3rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <StrategyOverview />
      <StrategyCharts />
      <StrategyComposition />
    </Box>
  )
}

export default StrategyInfo
