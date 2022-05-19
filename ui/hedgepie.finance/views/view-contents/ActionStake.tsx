import React, { useState, useEffect } from 'react'
import { Box, Input, Button, ThemeUICSSObject } from 'theme-ui'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { useVaultPools } from 'state/hooks'
import { useERC20Contract } from 'hooks/useContract'
import { useVault } from 'hooks/useVault'
import { getBalanceInEther, getBalanceInWei } from 'utils/formatBalance'
import ActionStakeButton from './ActionStakeButton'

import { getTokenName } from 'utils/addressHelpers'
import toast from '../../utils/toast'
import { styles } from './styles'

const ActionStake = (props: any) => {
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
    if (formType === 'DEPOSIT' && stakingTokenBalance?.eq(0)) {
      toast(
        'You do not have any ' + (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)}` : '') + ' to Stake',
        'warning',
      )
    } else if (formType === 'WITHDRAW' && stakedBalance?.eq(0)) {
      toast(
        'You do not have any ' + (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)}` : '') + ' to Withdraw',
        'warning',
      )
    } else if (stakingTokenBalance && formType === 'DEPOSIT' && new BigNumber(amount).gt(stakingTokenBalance)) {
      setInvalidAmount(true)
      toast(
        (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') +
          `Cannot Stake more than the Approved Amount`,
        'warning',
      )
    } else if (stakedBalance && formType == 'WITHDRAW' && amount && new BigNumber(amount).gt(stakedBalance)) {
      setInvalidAmount(true)
      toast(
        (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') +
          `Cannot Withdraw more than the Staked Amount`,
        'warning',
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
          'warning',
        )
      }

      setPending(false)
    } else {
      if (!(amount > 0)) {
        toast(
          'Allowed to stake more than 0.00 ' +
            (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)}` : '') +
            ' only',
          'warning',
        )
        return
      }
      setPending(true)
      try {
        await onStake(activePool.pid, amount)
        toast(
          (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') +
            `Staked ${amountString} Successfully`,
          'success',
        )
      } catch (err) {
        console.log('Staking error:', err)
        toast(
          (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') + `Transaction Error while Staking`,
          'warning',
        )
      }
      setPending(false)
      setAmount(0.0)
      setAmountString('0.00')
    }
  }

  const handleWithdraw = async () => {
    if (!(amount > 0)) {
      toast(
        'Allowed to withdraw more than 0.00 ' +
          (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)}` : '') +
          ' only',
        'warning',
      )
      return
    }
    setPending(true)
    try {
      await onUnstake(activePool?.pid, amount)
      toast(
        (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') +
          `Withdrew ${amountString} Successfully`,
        'success',
      )
    } catch (err) {
      console.log('Withdrawing error:', err)
      toast(
        (activePool?.lpToken ? `${getTokenName(activePool?.lpToken)} : ` : '') + `Transaction Error while Withdrawing`,
        'warning',
      )
    }
    setPending(false)
    setAmount(0.0)
    setAmountString('0.00')
  }

  const onChangeAmount = (e) => {
    setAmountString(e.target.value)
    if (e.target.value && (isNaN(e.target.value) || Number.parseFloat(e.target.value) < 0)) {
      setInvalidAmount(true)
      toast('Please input only Positive Numeric values', 'warning')
    }
    setInvalidAmount(false)
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
    <Box sx={{ border: '2px solid #1799DE', borderRadius: '35px' }}>
      <Box className="mobile-action" sx={styles.vault_action_button_container_mobile as ThemeUICSSObject}>
        <ActionStakeButton
          activePoolIdx={activePoolIdx}
          formType={formType}
          onApproveOrDeposit={handleApproveOrDeposit}
          onWithdraw={handleWithdraw}
          isPending={isPending}
          isDisabled={disabled}
        />
      </Box>
      <Box sx={styles.vault_action_container_desktop as ThemeUICSSObject}>
        <Box className="desktop-action" sx={styles.vault_action_button_container_desktop as ThemeUICSSObject}>
          <ActionStakeButton
            activePoolIdx={activePoolIdx}
            formType={formType}
            onApproveOrDeposit={handleApproveOrDeposit}
            onWithdraw={handleWithdraw}
            isPending={isPending}
            isDisabled={disabled}
          />
        </Box>
        <Button sx={styles.vault_action_max_button as ThemeUICSSObject} onClick={onMaxClick}>
          MAX
        </Button>
        <Input
          sx={styles.vault_action_input as ThemeUICSSObject}
          placeholder="0.0"
          value={amountString}
          type="number"
          onChange={onChangeAmount}
          id="amount-input"
        />
      </Box>
    </Box>
  )
}

export default ActionStake
