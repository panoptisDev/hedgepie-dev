import React from 'react'
import { Box } from 'theme-ui'
import VaultForm from './VaultForm'

const Vault = () => {
  return (
    <Box p={3}>
      <Box
        sx={{
          marginTop: 90,
          marginBottom: 90,
        }}
      >
        <VaultForm />
      </Box>
    </Box>
  )
}

export default Vault
