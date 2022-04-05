import React, { useState, useEffect } from 'react'
import { ThemeProvider, Box, Flex } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { useDispatch } from 'react-redux'
import { theme } from 'themes/theme'
import { HPSwitch } from 'components/Vault'
import { fetchVaultUserDataAsync } from 'state/actions'
import VaultTab from './VaultTab'
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

  const handleFormTypeChange = (value) => {
    setFormType(value)
  }

  return (
    <Box p={3}>
      <Box
        sx={{
          marginTop: 90,
          marginBottom: 90,
        }}
      >
        <Box
          sx={{
            backgroundColor: '#E5F6FF',
            borderRadius: 12,
            maxWidth: 556,
            margin: '0 auto',
          }}
        >
          <VaultTab
            value={formType}
            onChange={handleFormTypeChange}
          />
          <Box
            sx={{
              padding: 16,
              [`@media screen and (min-width: 600px)`]: {
                padding: 32,
              },
            }}
          >
            <VaultCard formType={formType} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Vault
