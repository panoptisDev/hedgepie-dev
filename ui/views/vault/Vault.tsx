import React, { useState, useEffect } from 'react'
import { ThemeProvider, Box, Flex } from 'theme-ui'
import { theme } from 'themes/theme'
import { HPButtonInput } from 'widgets/HPButtonInput'
import { HPInput } from 'widgets/HPInput'
import { HPInstrumentSelect } from 'widgets/HPInstrumentSelect'
import { HPStakeWithdrawSwitch } from 'widgets/HPStakeWithdrawSwitch'
import { HPVaultSummary } from 'widgets/HPVaultSummary'
import { useWeb3React } from '@web3-react/core'
import styles from './Vault.module.css'

type Props = {}

const Vault = (props: Props) => {
  const [apyVal, setApy] = useState('')
  const [profitVal, setProfit] = useState('')
  const [stakedVal, setStaked] = useState('')
  const [tvlVal, setTVL] = useState('')

  const { account } = useWeb3React()

  useEffect(() => {}, [account])

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Box
            p={3}
            sx={{ backgroundColor: '#E5F6FF', borderRadius: '11px', width: 'fit-content', height: 'fit-content' }}
          >
            <HPStakeWithdrawSwitch />
            <HPInstrumentSelect />
            <HPInput label="STAKED" placeholder={stakedVal} />
            <HPInput label="APY" placeholder={apyVal + '%'} />
            <HPInput label="Profit" placeholder={profitVal} />
            <HPButtonInput placeholder="0.00" />
            <HPVaultSummary platform={'Venus'} tvl={'$' + tvlVal} />
          </Box>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default Vault
