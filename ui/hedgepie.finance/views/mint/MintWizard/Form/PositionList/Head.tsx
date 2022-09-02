import React from 'react'
import { Box } from 'theme-ui'

const Head = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: ['column', 'column', 'row'],
        gap: 1,
      }}
    >
      <Box sx={{ flex: '1 1 0' }}>
        <Box
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1380B9',
          }}
        >
          Composition
        </Box>
        <Box
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: '#8988A5',
            [`@media screen and (min-width: 500px)`]: {
              fontSize: 24,
            },
          }}
        >
          Stake positions
        </Box>
      </Box>
      <Box sx={{ flex: '1 1 0', marginLeft: [0, 0, '20px'] }}>
        <Box
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1380B9',
            [`@media screen and (min-width: 500px)`]: {
              fontSize: 24,
            },
          }}
        >
          Weight
        </Box>
        <Box
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: '#8988A5',
            [`@media screen and (min-width: 500px)`]: {
              fontSize: 24,
            },
          }}
        >
          Percentage allocation
        </Box>
      </Box>
    </Box>
  )
}

export default Head
