import React from 'react'
import { Box } from 'theme-ui'

const Tag = ({ label, value, ...props }) => {
  return (
    <Box
      px={3}
      sx={{
        height: 34,
        border: '1px solid #D8D8D8',
        borderRadius: 34,
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 700
      }}
      {...props}
    >
      <Box sx={{ color: '#8E8DA0' }}>
        {label}
      </Box>
      <Box ml={1} sx={{ color: '#0A3F5C' }}>
        {value}
      </Box>
    </Box>
  )
}

export default Tag