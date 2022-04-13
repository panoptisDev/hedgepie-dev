import React from 'react'
import { Box, Text } from 'theme-ui'

const HPInfo = ({ label, value, id }) => {
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
      id={id}
    >
      <Text
        sx={{
          fontWeight: 700,
          color: '#16103A',
        }}
        id="lineinfo-label"
      >
        {label}
      </Text>
      <Text
        sx={{
          fontWeight: 700,
          color: '#8E8DA0',
        }}
        id="lineinfo-value"
      >
        {value}
      </Text>
    </Box>
  )
}

export default HPInfo
