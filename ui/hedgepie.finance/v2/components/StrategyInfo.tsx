import React from 'react'
import { Box } from 'theme-ui'
import StrategyOverview from './StrategyOverview'

function StrategyInfo() {
  return (
    <Box sx={{ margin: '2rem 3rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <StrategyOverview />
    </Box>
  )
}

export default StrategyInfo
