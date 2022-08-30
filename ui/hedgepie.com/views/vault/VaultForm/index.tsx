import React, { useState, useEffect } from 'react'
import { Box, ThemeUICSSObject } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { useDispatch } from 'react-redux'
import { fetchVaultUserDataAsync } from 'state/actions'
import FormTab from './FormTab'
import FormBody from './FormBody'

import { styles } from './styles'

const VaultForm = () => {
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
    <Box className="vault-form" sx={styles.vault_container as ThemeUICSSObject}>
      <FormTab value={formType} onChange={handleFormTypeChange} />
      <Box
        sx={{
          padding: 16,
          [`@media screen and (min-width: 600px)`]: {
            padding: 32,
          },
        }}
      >
        <FormBody formType={formType} />
      </Box>
    </Box>
  )
}

export default VaultForm
