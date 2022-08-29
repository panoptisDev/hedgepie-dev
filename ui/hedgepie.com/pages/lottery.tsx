/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import { Lottery } from 'views/lottery'
import { HedgePieFinance } from 'components/HedgePieFinance'

const LotteryPage: NextPage = () => {
  return (
    <HedgePieFinance title="Lottery">
      <Lottery />
    </HedgePieFinance>
  )
}

export default LotteryPage
