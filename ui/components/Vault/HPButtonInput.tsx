import React, { useState } from 'react'
import { ThemeProvider, Box, Input, Button, Badge, Flex } from 'theme-ui'
import { theme } from 'themes/theme'
import { useWeb3React } from '@web3-react/core'
import { ConnectWallet } from 'components/ConnectWallet'
import { useVaultPools } from 'state/hooks'
import { useERC20Contract } from 'hooks/useContract'
import { useVault } from 'hooks/useVault'

type Props = {
  activePoolIdx?: number
  formType: string
}

const HPButtonInput = (props: Props) => {
  const { activePoolIdx, formType } = props
  const [isPending, setPending] = useState(false)
  const [amount, setAmount] = useState('')

  const { account } = useWeb3React()
  const pools = useVaultPools()
  const { onApprove, onStake, onUnstake, onClaim } = useVault()
  const activePool = pools.find((pool) => pool.pid === activePoolIdx)
  const userData = activePool?.userData
  const tokenContract = useERC20Contract(activePool?.lpToken || '')
  const isApproved = userData && userData.allowance > 0

  const onApproveOrDeposit = async () => {
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

  const onWithdraw = async () => {
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

  const getBtnText = () => {
    if (isPending) return 'Pending...'
    if (formType === 'DEPOSIT') return isApproved ? 'Stake' : 'Approve'
    if (formType === 'WITHDRAW') return 'Unstake'
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          marginBottom: '10px',
          backgroundColor: '#fff',
          borderRadius: '31px',
        }}
      >
        <Flex sx={{ position: 'absolute', marginTop: 0, height: '100%', gap: '10px', zIndex: '1' }}>
          {account ? (
            <Button
              {...props}
              sx={{
                background: '#1799DE',
                borderRadius: '50px',
                padding: '0px 48.5px',
                cursor: 'pointer',
                '&:disabled': {},
              }}
              disabled={isPending || !account}
              onClick={() => {
                formType === 'DEPOSIT' ? onApproveOrDeposit() : onWithdraw()
              }}
            >
              {getBtnText()}
            </Button>
          ) : (
            <ConnectWallet />
          )}
          <Badge
            sx={{
              width: 'fit-content',
              height: 'fit-content',
              alignSelf: 'center',
              backgroundColor: 'rgba(160, 160, 160, 0.32)',
              borderRadius: '4px',
              color: '#8E8DA0',
              fontWeight: '300',
            }}
          >
            MAX
          </Badge>
        </Flex>
        <Input
          sx={{
            position: 'relative',
            height: '56px',
            borderRadius: '30px',
            minWidth: '30rem',
            boxShadow: 'none',
            border: 'none',
            outline: 0,
            fontSize: '16px',
            paddingRight: '1rem',
            textAlign: 'right',
            fontWeight: '600',
            color: '#8E8DA0',
          }}
          maxLength={6}
          placeholder="0.0"
          value={amount}
          onChange={onChangeAmount}
        />
      </Box>
    </ThemeProvider>
  )
}

export default HPButtonInput
