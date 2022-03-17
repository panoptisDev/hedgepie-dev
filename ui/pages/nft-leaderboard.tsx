/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'

// Components
import { HedgePieFinance } from 'components/HedgePieFinance'
import LeaderboardHero from 'views/nft-leaderboard/LeaderboardHero'
import LeaderboardMain from 'views/nft-leaderboard/LeaderboardMain'

const FinishedLotteries: NextPage = () => {
  return (
    <HedgePieFinance>
      <LeaderboardHero />
      <LeaderboardMain />
    </HedgePieFinance>
  )
}

export default FinishedLotteries
