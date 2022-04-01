import React, { useState, useEffect } from 'react'
import { ThemeProvider, Box, Flex } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { useDispatch } from 'react-redux'
import { theme } from 'themes/theme'
import { HPSwitch } from 'components/Vault'
import { fetchVaultUserDataAsync } from 'state/actions'
import VaultCard from './VaultCard'

type Props = {}

const Vault = (props: Props) => {
  const [formType, setFormType] = useState('DEPOSIT')

  const dispatch = useDispatch()
  const { account } = useWeb3React()

  useEffect(() => {
    if (account) {
      dispatch(fetchVaultUserDataAsync(account))
    }
  }, [account, dispatch])

  const onChangeFormType = () => {
    setFormType(formType === 'DEPOSIT' ? 'WITHDRAW' : 'DEPOSIT')
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Box
            p={3}
            sx={{ backgroundColor: '#E5F6FF', borderRadius: '11px', width: 'fit-content', height: 'fit-content' }}
          >
            <HPSwitch value={formType === 'DEPOSIT' ? 'on' : 'off'} onSwitch={onChangeFormType} />
            <VaultCard formType={formType} />
          </Box>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default Vault
