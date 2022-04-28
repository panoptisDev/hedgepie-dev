import React from 'react'
import { Box, Button } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { useVaultPools } from 'state/hooks'
import useWalletModal from 'widgets/WalletModal/useWalletModal'
import useAuth from 'hooks/useAuth'

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
          sx={{
            height: 62,
            borderRadius: 62,
            cursor: 'pointer',
            width: '100%',
            flexShrink: 0,
          }}
          disabled={isPending || !account || isDisabled}
          onClick={() => {
            formType === 'DEPOSIT' ? onApproveOrDeposit() : onWithdraw()
          }}
          id="action-button"
        >
          {getBtnText()}
        </Button>
      ) : (
        <Button
          sx={{
            height: 62,
            borderRadius: 62,
            cursor: 'pointer',
            width: '100%',
            flexShrink: 0,
          }}
          onClick={onPresentConnectModal}
          id="action-button"
        >
          Connect Wallet
        </Button>
      )}
    </>
  )
}

export default ActionMainButton
