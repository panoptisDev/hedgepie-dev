/* eslint-disable no-use-before-define */
import React from 'react'
import type { NextPage } from 'next'

import { ViewContents } from 'views/view-contents'
import { HedgePieFinance } from 'components/HedgePieFinance'

const ViewContentsPage: NextPage = () => {
  return (
    <HedgePieFinance title="View Contents">
      <ViewContents />
    </HedgePieFinance>
  )
}

export default ViewContentsPage
