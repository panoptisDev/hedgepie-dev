import React, { useState, useEffect } from 'react'
import { Box, Input, Button } from 'theme-ui'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { useVaultPools } from 'state/hooks'
import { useERC20Contract } from 'hooks/useContract'
import { useVault } from 'hooks/useVault'
import { getBalanceInEther, getBalanceInWei } from 'utils/formatBalance'
import ActionMainButton from './ActionMainButton'

import { getTokenName } from 'utils/addressHelpers'
import toast from '../../../../utils/toast'

type Props = {
  activePoolIdx?: number
  formType: string
  stakedBalance: BigNumber | undefined
  stakingTokenBalance: BigNumber | undefined
}

const ActionMain = (props: Props) => {
  const { activePoolIdx, formType, stakedBalance, stakingTokenBalance } = props

  const [isPending, setPending] = useState(false)
  const [amount, setAmount] = useState<number | BigNumber>(0.0)
  const [amountString, setAmountString] = useState('0.00')
  const [disabled, setDisabled] = useState(false)
  const [invalidAmount, setInvalidAmount] = useState(false)
  const { account } = useWeb3React()
  const pools = useVaultPools()
  const { onApprove, onStake, onUnstake, onClaim } = useVault()
  const activePool = pools.find((pool) => pool.pid === activePoolIdx)
  const userData = activePool?.userData
  const tokenContract = useERC20Contract(activePool?.lpToken || '')
  const isApproved = userData && userData.allowance > 0

  // Setting parameters for the button to be disabled/enabled
  useEffect(() => {
    if (stakingTokenBalance && formType === 'DEPOSIT' && new BigNumber(amount).gt(stakingTokenBalance)) {
      setInvalidAmount(true)
      toast(
        (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') +
          `Cannot Stake more than the Approved Amount`,
      )
    } else if (stakedBalance && formType == 'WITHDRAW' && amount && new BigNumber(amount).gt(stakedBalance)) {
      setInvalidAmount(true)
      toast(
        (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') +
          `Cannot Withdraw more than the Staked Amount`,
      )
    } else {
      setInvalidAmount(false)
    }
  }, [stakedBalance, stakingTokenBalance, amount])

  useEffect(() => {
    setDisabled(invalidAmount || isPending || !account)
  }, [invalidAmount, isPending, account])

  useEffect(() => {
    setAmount(0.0)
    setAmountString('0.00')
  }, [formType, activePoolIdx])

  const handleApproveOrDeposit = async () => {
    if (!isApproved) {
      setPending(true)
      try {
        await onApprove(tokenContract)
      } catch (err) {
        console.log('Approve error:', err)
        toast(
          (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') + `Transaction Error while Approving`,
        )
      }

      setPending(false)
    } else {
      setPending(true)

      try {
        await onStake(activePool.pid, amount)
        toast(
          (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') +
            `Staked ${amountString} Successfully`,
        )
      } catch (err) {
        console.log('Staking error:', err)
        toast(
          (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') + `Transaction Error while Staking`,
        )
      }
      setPending(false)
      setAmount(0.0)
      setAmountString('0.00')
    }
  }

  const handleWithdraw = async () => {
    setPending(true)
    try {
      await onUnstake(activePool?.pid, amount)
      toast(
        (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') +
          `Withdrew ${amountString} Successfully`,
      )
    } catch (err) {
      console.log('Withdrawing error:', err)
      toast(
        (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') + `Transaction Error while Withdrawing`,
      )
    }
    setPending(false)
    setAmount(0.0)
    setAmountString('0.00')
  }

  const onChangeAmount = (e) => {
    setAmountString(e.target.value)
    e.target.value && !isNaN(e.target.value) && setAmount(getBalanceInWei(e.target.value))
  }

  const onMaxClick = () => {
    if (formType === 'DEPOSIT' && isApproved) {
      if (stakingTokenBalance) {
        setAmount(stakingTokenBalance)
        setAmountString(getBalanceInEther(stakingTokenBalance).toFixed(2))
      }
    } else if (formType === 'WITHDRAW') {
      if (stakedBalance) {
        setAmount(stakedBalance)
        setAmountString(getBalanceInEther(stakedBalance).toFixed(2))
      }
    }
  }

  return (
    <Box>
      <Box
        className="mobile-action"
        sx={{
          display: 'block',
          marginBottom: 2,
          width: '100%',
          [`@media screen and (min-width: 600px)`]: {
            display: 'none',
          },
        }}
      >
        <ActionMainButton
          activePoolIdx={activePoolIdx}
          formType={formType}
          onApproveOrDeposit={handleApproveOrDeposit}
          onWithdraw={handleWithdraw}
          isPending={isPending}
          isDisabled={disabled}
        />
      </Box>
      <Box
        sx={{
          height: 62,
          backgroundColor: '#fff',
          borderRadius: 62,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          className="desktop-action"
          sx={{
            display: 'none',
            [`@media screen and (min-width: 600px)`]: {
              display: 'block',
              flexShrink: 0,
              width: 200,
            },
          }}
        >
          <ActionMainButton
            activePoolIdx={activePoolIdx}
            formType={formType}
            onApproveOrDeposit={handleApproveOrDeposit}
            onWithdraw={handleWithdraw}
            isPending={isPending}
            isDisabled={disabled}
          />
        </Box>
        <Button
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
            },
          }}
          onClick={onMaxClick}
        >
          MAX
        </Button>
        <Input
          sx={{
            boxShadow: 'none',
            border: 'none',
            outline: 0,
            textAlign: 'right',
            fontSize: 24,
            fontWeight: 700,
            color: '#8E8DA0',
            paddingRight: 32,
          }}
          placeholder="0.0"
          value={amountString}
          onChange={onChangeAmount}
          id="amount-input"
        />
      </Box>
    </Box>
  )
}

export default ActionMain
