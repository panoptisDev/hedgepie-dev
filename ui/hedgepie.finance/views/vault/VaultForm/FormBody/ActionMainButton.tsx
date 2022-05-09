import React from 'react'
import { Box, Button, ThemeUICSSObject } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { useVaultPools } from 'state/hooks'
import useWalletModal from 'widgets/WalletModal/useWalletModal'
import useAuth from 'hooks/useAuth'

import { styles } from '../styles'

const ActionMainButton = ({ activePoolIdx, formType, onApproveOrDeposit, onWithdraw, isPending, isDisabled }) => {
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout)
  const { account } = useWeb3React()
  const pools = useVaultPools()
  const activePool = pools.find((pool) => pool.pid === activePoolIdx)
  const userData = activePool?.userData
  const isApproved = userData && userData.allowance > 0

  const getBtnText = () => {
    if (isPending) return 'Pending...'
    if (isDisabled) return 'Invalid Input' // Can be used for any type of invalid input like non-digit characters etc.
    if (formType === 'DEPOSIT') return isApproved ? 'Stake' : 'Approve'
    if (formType === 'WITHDRAW') return 'Unstake'
  }

  return (
    <>
      {account ? (
        <Button
          sx={styles.vault_action_button as ThemeUICSSObject}
          disabled={isPending || !account || isDisabled}
          onClick={() => {
            formType === 'DEPOSIT' ? onApproveOrDeposit() : onWithdraw()
          }}
          id="action-button"
        >
          {getBtnText()}
        </Button>
      ) : (
        <Button sx={styles.vault_action_button as ThemeUICSSObject} onClick={onPresentConnectModal}>
          Connect Wallet
        </Button>
      )}
    </>
  )
}

export default ActionMainButton
