import React from 'react'
import { Box, Text } from 'theme-ui'

interface RiskInformationProps {
  tokenId: number
}

function RiskInformation(props: RiskInformationProps) {
  return (
    <Box
      sx={{
        borderRadius: '16px',
        boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
        border: '1px solid #D9D9D9',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        background: '#FFFFFF',
        padding: '1rem 2rem',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text sx={{ color: '#14114B', fontSize: '20px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans' }}>
          Risk Information
        </Text>
      </Box>
    </Box>
  )
}

export default RiskInformation
