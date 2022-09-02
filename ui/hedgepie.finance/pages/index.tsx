/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'

// Components
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Home } from 'views/home'
import { LeaderBoard } from 'views/nft-leaderboard'

import LeaderboardMain from 'views/nft-leaderboard/LeaderBoard'
import PRSection from 'views/pr-section/PRSection'
import { TitleMast } from 'components/TitleMast'

const HomePage: NextPage = () => {
  return (
    <>
      <HedgePieFinance dark={true} overlayHeader={false}>
        <TitleMast title="YBNFT Leaderboard" />
        <LeaderBoard />
      </HedgePieFinance>
    </>
  )
}

export default HomePage
