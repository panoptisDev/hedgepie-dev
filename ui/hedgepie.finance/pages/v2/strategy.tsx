/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Box } from 'theme-ui'
import DashboardPage from 'v2/components/DashboardPage'
import StrategyInfo from 'v2/components/Strategy/StrategyInfo'

const Strategy: NextPage = () => {
  return (
    <HedgePieFinance isV2={true}>
      <DashboardPage tab="stats">
        <StrategyInfo />
      </DashboardPage>
    </HedgePieFinance>
  )
}

export default Strategy
