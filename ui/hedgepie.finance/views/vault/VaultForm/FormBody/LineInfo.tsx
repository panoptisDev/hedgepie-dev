import React from 'react'
import { Box, Text } from 'theme-ui'

const HPInfo = ({ label, value }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        height: 62,
        borderRadius: 62,
        padding: '0px 32px',
      }}
    >
      <Text
        sx={{
          fontWeight: 700,
          color: '#16103A',
        }}
      >
        {label}
      </Text>
      <Text
        sx={{
          fontWeight: 700,
          color: '#8E8DA0',
        }}
      >
        {value}
      </Text>
    </Box>
  )
}

export default HPInfo
