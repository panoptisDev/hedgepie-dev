import React, { useState, useEffect } from 'react'
import { Box, Input, Button, ThemeUICSSObject } from 'theme-ui'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { getBalanceInWei } from 'utils/formatBalance'
import ActionStakeButton from './ActionStakeButton'
import { useInvestor } from 'hooks/useInvestor'

import { getWBNBAddress } from 'utils/addressHelpers'
import toast from '../../utils/toast'
import { styles } from './styles'

const ActionStake = (props: any) => {
  const { onYBNFTDeposit, onYBNFTWithdraw, onYBNFTInvestorApprove } = useInvestor()
  const { tokenId } = props

  const [disabled, setDisabled] = useState(false)
  const [amount, setAmount] = useState<number | BigNumber>(0.0)
  const [amountString, setAmountString] = useState('0.00')

  const [invalidAmount, setInvalidAmount] = useState(false)
  const { account } = useWeb3React()
  const [approved, setApproved] = useState(false)

  useEffect(() => {
    setDisabled(invalidAmount || !account)
  }, [invalidAmount])

  const handleApprove = async () => {
    let txHash
    try {
      txHash = await onYBNFTInvestorApprove()
      setApproved(true)
    } catch (err) {
      console.log(err)
    }
    console.log(txHash)
  }

  const handleStake = async () => {
    let txHash
    try {
      txHash = await onYBNFTDeposit(tokenId, getWBNBAddress(), amount)
    } catch (err) {
      console.log(err)
    }
    console.log(txHash)
  }

  const handleUnstake = async () => {
    let txHash
    try {
      txHash = await onYBNFTWithdraw(tokenId, getWBNBAddress())
    } catch (err) {
      console.log(err)
    }
    console.log(txHash)
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

  return (
    <>
      <Box sx={{ border: '2px solid #1799DE', borderRadius: '35px' }}>
        <Box className="mobile-action" sx={styles.vault_action_button_container_mobile as ThemeUICSSObject}>
          <ActionStakeButton
            onStake={handleStake}
            isDisabled={disabled}
            onApprove={handleApprove}
            approved={approved}
          />
        </Box>
        <Box sx={styles.vault_action_container_desktop as ThemeUICSSObject}>
          <Box className="desktop-action" sx={styles.vault_action_button_container_desktop as ThemeUICSSObject}>
            <ActionStakeButton onStake={handleStake} isDisabled={false} onApprove={handleApprove} approved={approved} />
          </Box>

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
      <Button sx={styles.unstake_button as ThemeUICSSObject} onClick={handleUnstake}>
        UNSTAKE
      </Button>
    </>
  )
}

export default ActionStake
