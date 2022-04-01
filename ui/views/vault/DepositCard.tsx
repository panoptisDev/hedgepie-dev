import React, { useState, useEffect } from 'react'
import { useVault, useVaultPools } from 'state/hooks'
import HPButtonInput from 'components/Vault/HPButtonInput'
import HPInfo from 'components/Vault/HPInfo'
import { HPInstrumentSelect } from 'widgets/HPInstrumentSelect'
import { HPVaultSummary } from 'widgets/HPVaultSummary'
import { getTvl, getApy } from 'utils/getPrice'

type Props = {}

const DepositCard = (props: Props) => {
  const vault = useVault()
  const pools = useVaultPools()
  const activePool = pools.find((pool) => pool.pid === 0)
  const userData = activePool?.userData
  const activePoolRewardAllocation = vault.totalAllocPoint ? (activePool?.allocPoint || 0) / vault?.totalAllocPoint : 0

  // get tvl, apy
  const userStatkedBalance = userData ? userData.stakedBalance : 0.0
  const tvl = getTvl(activePool?.lpToken, activePool?.totalStaked)
  const poolApy = getApy(vault.rewardToken, vault.rewardPerBlock, activePoolRewardAllocation, tvl)
  const userProfit = userData ? userData.pendingReward.toFixed(3) : 0.0

  return (
    <>
      <HPInstrumentSelect />
      <HPInfo label="STAKED" value={String(userStatkedBalance)} />
      <HPInfo label="APY" value={`${poolApy}%`} />
      <HPInfo label="Profit" value={String(userProfit)} />
      <HPButtonInput />
      <HPVaultSummary tvl={`$${tvl}`} />
    </>
  )
}

export default DepositCard
