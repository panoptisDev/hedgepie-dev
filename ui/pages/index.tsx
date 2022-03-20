/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'

// Components
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Footer } from 'components/Footer'
import { Home } from 'views/home'

const HomePage: NextPage = () => {
  return (
    <>
      {/* <HedgePieFinance> */}
      <Home />
      <Footer />
      {/* </HedgePieFinance> */}
    </>
  )
}

export default HomePage
