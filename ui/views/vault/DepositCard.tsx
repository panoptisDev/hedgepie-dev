import React, { useState, useEffect } from 'react'
import { useVaultPools } from 'state/hooks'
import HPButtonInput from 'components/Vault/HPButtonInput'
import HPInfo from 'components/Vault/HPInfo'
import { HPInstrumentSelect } from 'widgets/HPInstrumentSelect'
import { HPVaultSummary } from 'widgets/HPVaultSummary'

type Props = {}

const DepositCard = (props: Props) => {
  const pools = useVaultPools()
  const activePool = pools.find((pool) => pool.pid === 0)
  const userData = activePool?.userData
  const statkedBalance = userData ? userData.stakedBalance : 0.0

  return (
    <>
      <HPInstrumentSelect />
      <HPInfo label="STAKED" value={String(statkedBalance)} />
      <HPInfo label="APY" value={'0' + '%'} />
      <HPInfo label="Profit" value={'0'} />
      <HPButtonInput placeholder="0.00" />
      <HPVaultSummary tvl={'$' + '0'} />
    </>
  )
}

export default DepositCard
