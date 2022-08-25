/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'

// Components
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Home } from 'views/home'
import { LeaderBoard } from 'views/nft-leaderboard'

import LeaderboardMain from 'views/nft-leaderboard/LeaderBoard'
import PRSection from 'views/pr-section/PRSection'

const HomePage: NextPage = () => {
  return (
    <>
      <PRSection />
      <HedgePieFinance dark={false} overlayHeader={false}>
        <Home />
      </HedgePieFinance>
    </>
  )
}

export default HomePage
