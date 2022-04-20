import React from 'react'
import { Box, Button } from 'theme-ui'

const HPAction = () => {
  return (
    <Box
      sx={{
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Button
        variant="primary"
        sx={{
          borderRadius: 40,
          width: 188,
          height: 38,
          padding: '0 24px',
          cursor: 'pointer',
          transition: 'all .2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        id="harvest-button"
      >
        Harvest
      </Button>
      <Button
        variant="primary"
        sx={{
          borderRadius: 40,
          width: 188,
          height: 38,
          padding: '0 24px',
          cursor: 'pointer',
          transition: 'all .2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        id="compound-button"
      >
        Compound
      </Button>
    </Box>
  )
}

export default HPAction
