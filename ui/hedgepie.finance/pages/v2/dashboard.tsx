/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Box } from 'theme-ui'
import DashboardPage from 'v2/components/DashboardPage'

const Dashboard: NextPage = () => {
  return (
    <HedgePieFinance isV2={true}>
      <DashboardPage>kjhkj</DashboardPage>
    </HedgePieFinance>
  )
}

export default Dashboard
