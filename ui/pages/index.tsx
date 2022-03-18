/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'

// Components
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Home } from 'views/home'

const HomePage: NextPage = () => {
  return (
    // <HedgePieFinance>
    <Home />
    // </HedgePieFinance>
  )
}

export default HomePage
