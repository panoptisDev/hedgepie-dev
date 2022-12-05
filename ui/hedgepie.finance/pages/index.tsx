/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Box } from 'theme-ui'
import DashboardPage from 'v2/components/DashboardPage'
import LeaderboardContent from 'v2/components/Leaderboard/LeaderboardContent'

const Leaderboard: NextPage = () => {
  return (
    <HedgePieFinance isV2={true}>
      <DashboardPage tab="leaderboard">
        <LeaderboardContent />
      </DashboardPage>
    </HedgePieFinance>
  )
}

export default Leaderboard
