import React, { useState } from 'react'
import { Box } from 'theme-ui'
import { useVault, useVaultPools } from 'state/hooks'
import LineInstrument from './LineInstrument'
import LineInfo from './LineInfo'
import LineTvl from './LineTvl'
import ActionMain from './ActionMain'
import ActionSecond from './ActionSecond'
import { getTvl, getApy } from 'utils/getPrice'
import { getTokenName } from 'utils/addressHelpers'
import { getBalanceInEther } from 'utils/formatBalance'

const FormBody = ({ formType }) => {
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
  const userStatkedBalance = userData ? getBalanceInEther(userData.stakedBalance) : 0.0
  const tvl = getTvl(activePool?.lpToken, activePool?.totalStaked)
  const poolApy = getApy(vault.rewardToken, vault.rewardPerBlock, activePoolRewardAllocation, tvl)
  const userProfit = userData ? getBalanceInEther(userData.pendingReward) : 0.0

  const items = pools.map((pool, idx) => {
    return {
      name: getTokenName(pool.lpToken),
      value: idx,
    }
  })

  return (
    <Box>
      <LineInstrument items={items} onChangePoolIdx={onChangePoolIdx} />
      <Box mt={3}>
        <LineInfo label="STAKED" id="staked-info" value={String(userStatkedBalance.toFixed(2))} />
      </Box>
      <Box mt={3}>
        <LineInfo label="APY" id="apy-info" value={`${poolApy.toFixed(2)}%`} />
      </Box>
      <Box mt={3}>
        <LineInfo label="Profit" id="profit-info" value={String(userProfit.toFixed(2))} />
      </Box>
      <Box mt={4}>
        <ActionMain
          activePoolIdx={activePoolIdx}
          formType={formType}
          stakedBalance={userData?.stakedBalance}
          stakingTokenBalance={userData?.stakingTokenBalance}
        />
      </Box>
      <Box mt={4} px={4}>
        <LineTvl>${tvl.toFixed(2)}</LineTvl>
      </Box>
      <Box sx={{ height: 80, marginTop: 4 }}>{formType === 'DEPOSIT' && <ActionSecond />}</Box>
    </Box>
  )
}

export default FormBody
