/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import { Swap } from 'views/swap'
import { HedgePieFinance } from 'components/HedgePieFinance'

const SwapPage: NextPage = () => {
  return (
    <HedgePieFinance title="Swap">
      <Swap />
    </HedgePieFinance>
  )
}

export default SwapPage
