import React, { useEffect, useState } from 'react'
import { useVault, useVaultPools } from 'state/hooks'
import HPButtonInput from 'components/Vault/HPButtonInput'
import { HPSelect, HPInfo } from 'components/Vault'
import { HPVaultSummary } from 'widgets/HPVaultSummary'
import { getTvl, getApy } from 'utils/getPrice'
import { getTokenName } from 'utils/addressHelpers'

type Props = {
  formType: string
}

const VaultCard = (props: Props) => {
  const { formType } = props
  const [activePoolIdx, setActivePoolIdx] = useState(0)
  const vault = useVault()
  const pools = useVaultPools()
  const activePool = pools.find((pool) => pool.pid === activePoolIdx)
  const userData = activePool?.userData
  const activePoolRewardAllocation = vault.totalAllocPoint ? (activePool?.allocPoint || 0) / vault?.totalAllocPoint : 0

  const onChangePoolIdx = (idx: string) => {
    setActivePoolIdx(Number(idx))
  }

  // get tvl, apy
  const userStatkedBalance = userData ? userData.stakedBalance : 0.0
  const tvl = getTvl(activePool?.lpToken, activePool?.totalStaked)
  const poolApy = getApy(vault.rewardToken, vault.rewardPerBlock, activePoolRewardAllocation, tvl)
  const userProfit = userData ? userData.pendingReward : 0.0

  const items = pools.map((pool, idx) => {
    return {
      name: getTokenName(pool.lpToken),
      value: idx,
    }
  })

  return (
    <>
      <HPSelect items={items} onChangePoolIdx={onChangePoolIdx} />
      <HPInfo label="STAKED" value={String(userStatkedBalance.toFixed(2))} />
      <HPInfo label="APY" value={`${poolApy.toFixed(2)}%`} />
      <HPInfo label="Profit" value={String(userProfit.toFixed(2))} />
      <HPButtonInput
        activePoolIdx={activePoolIdx}
        formType={formType}
        stakedBalance={userData?.stakedBalance}
        allowance={userData?.allowance}
      />
      <HPVaultSummary tvl={`$${tvl.toFixed(2)}`} />
    </>
  )
}

export default VaultCard
