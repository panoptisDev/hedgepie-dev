import React, { useState } from 'react'
import { ThemeProvider, Box, Flex } from 'theme-ui'
import { theme } from 'themes/theme'
import { HPStakeWithdrawSwitch } from 'widgets/HPStakeWithdrawSwitch'
import DepositCard from './DepositCard'
import WithdrawCard from './WithdrawCard'

type Props = {}

const Vault = (props: Props) => {
  const [formType, setFormType] = useState('deposit')

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Box
            p={3}
            sx={{ backgroundColor: '#E5F6FF', borderRadius: '11px', width: 'fit-content', height: 'fit-content' }}
          >
            <HPStakeWithdrawSwitch />
            {formType === 'deposit' && <DepositCard />}
            {formType === 'withdraw' && <WithdrawCard />}
          </Box>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default Vault
