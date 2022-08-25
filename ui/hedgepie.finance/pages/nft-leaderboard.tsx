/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'

// Components
import { HedgePieFinance } from 'components/HedgePieFinance'
import LeaderboardMain from 'views/nft-leaderboard/LeaderBoard'

const FinishedLotteries: NextPage = () => {
  return (
    <HedgePieFinance title="YB NFT Leaderboard">
      <LeaderboardMain />
    </HedgePieFinance>
  )
}

export default FinishedLotteries
