import React from 'react'
import type { NextPage } from 'next'
import { HedgePieFinance } from 'components/HedgePieFinance'
import { Vault } from 'views/vault'
import { useFetchPublicData } from 'state/hooks'

const VaultPage: NextPage = () => {
  useFetchPublicData()

  return (
    <HedgePieFinance title="Farms">
      <Vault />
    </HedgePieFinance>
  )
}

export default VaultPage
