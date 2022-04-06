import React, { useState } from 'react'
import { Box, Input, Badge } from 'theme-ui'
import { useVaultPools } from 'state/hooks'
import { useERC20Contract } from 'hooks/useContract'
import { useVault } from 'hooks/useVault'
import ActionMainButton from './ActionMainButton'

const HPButtonInput = ({ activePoolIdx, formType }) => {

  const [isPending, setPending] = useState(false)
  const [amount, setAmount] = useState('')

  const pools = useVaultPools()
  const { onApprove, onStake, onUnstake } = useVault()
  const activePool = pools.find((pool) => pool.pid === activePoolIdx)
  const userData = activePool?.userData
  const tokenContract = useERC20Contract(activePool?.lpToken || '')
  const isApproved = userData && userData.allowance > 0

  const handleApproveOrDeposit = async () => {
    if (!isApproved) {
      setPending(true)

      try {
        await onApprove(tokenContract)
      } catch (err) {
        console.log('Approve error:', err)
      }

      setPending(false)
    } else {
      setPending(true)
      try {
        await onStake(activePool.pid, amount)
      } catch (err) {
        console.log('Staking error:', err)
      }
      setPending(false)
      setAmount('')
    }
  }

  const handleWithdraw = async () => {
    setPending(true)
    try {
      await onUnstake(activePool?.pid, amount)
    } catch (err) {
      console.log('Staking error:', err)
    }
    setPending(false)
    setAmount('')
  }

  const onChangeAmount = (e) => {
    setAmount(e.target.value)
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'block',
          marginBottom: 2,
          width: '100%',
          [`@media screen and (min-width: 600px)`]: {
            display: 'none'
          }
        }}
      >
        <ActionMainButton
          activePoolIdx={activePoolIdx}
          formType={formType}
          onApproveOrDeposit={handleApproveOrDeposit}
          onWithdraw={handleWithdraw}
          isPending={isPending}
        />
      </Box>
      <Box
        sx={{
          height: 62,
          backgroundColor: '#fff',
          borderRadius: 62,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            display: 'none',
            [`@media screen and (min-width: 600px)`]: {
              display: 'block',
              flexShrink: 0,
              width: 200
            }
          }}
        >
          <ActionMainButton
            activePoolIdx={activePoolIdx}
            formType={formType}
            onApproveOrDeposit={handleApproveOrDeposit}
            onWithdraw={handleWithdraw}
            isPending={isPending}
          />
        </Box>
        <Badge
          sx={{
            width: 44,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(160, 160, 160, 0.32)',
            borderRadius: '4px',
            color: '#8E8DA0',
            flexShrink: 0,
            margin: '0 8px 0 32px',
            [`@media screen and (min-width: 600px)`]: {
              margin: '0 8px',
            }
          }}
        >
          MAX
        </Badge>
        <Input
          sx={{
            boxShadow: 'none',
            border: 'none',
            outline: 0,
            textAlign: 'right',
            fontSize: 24,
            fontWeight: 700,
            color: '#8E8DA0',
            paddingRight: 32
          }}
          maxLength={6}
          placeholder="0.0"
          value={amount}
          onChange={onChangeAmount}
        />
      </Box>
    </Box>
  )
}

export default HPButtonInput
