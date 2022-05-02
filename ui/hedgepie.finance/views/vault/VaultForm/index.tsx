import React, { useState, useEffect } from 'react'
import { Box } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { useDispatch } from 'react-redux'
import { fetchVaultUserDataAsync } from 'state/actions'
import FormTab from './FormTab'
import FormBody from './FormBody'

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
    <Box
      className="vault-form"
      sx={{
        backgroundColor: '#E5F6FF',
        borderRadius: 12,
        maxWidth: 556,
        margin: '0 auto',
      }}
    >
      <FormTab
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
        <FormBody formType={formType} />
      </Box>
    </Box>
  )
}

export default VaultForm
