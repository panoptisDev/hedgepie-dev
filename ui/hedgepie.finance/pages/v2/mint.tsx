/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Box } from 'theme-ui'
import DashboardPage from 'v2/components/DashboardPage'
import LeaderboardMain from 'views/nft-leaderboard/LeaderBoard'
import { Mint } from 'views/mint'
import MintWizard from 'views/mint/MintWizard'

const Leaderboard: NextPage = () => {
  return (
    <HedgePieFinance isV2={true}>
      <DashboardPage tab="mint">
        <MintWizard />
      </DashboardPage>
    </HedgePieFinance>
  )
}

export default Leaderboard
