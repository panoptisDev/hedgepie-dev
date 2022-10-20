import React from 'react'
import { Box, Text } from 'theme-ui'

const Head = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        padding: '1rem',
        gap: 1,
      }}
    >
      <Text sx={{ color: '#14114B', fontSize: '24px', fontWeight: '600' }}>Strategy Composition</Text>
    </Box>
  )
}

export default Head
