import React from 'react'
import { Box, Button, Input, Text } from 'theme-ui'

function PRSection() {
  return (
    <Box sx={{ background: 'url(/images/top-banner.svg)', width: '100%', height: '7em' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '3rem',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Text sx={{ color: '#fff', fontFamily: 'Plus Jakarta Sans', fontSize: '36px', fontWeight: '700' }}>
          Get a slice of the DeFi Pie
        </Text>
        <Text
          sx={{
            color: '#fff',
            fontFamily: 'Plus Jakarta Sans',
            fontSize: '18px',
            fontWeight: '500',
            width: '16rem',
            overflow: 'initial',
          }}
        >
          We're not yet live, but be the first to know when we do!
        </Text>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <Input
            placeholder="Enter your best email here"
            sx={{
              textAlign: 'left',
              color: '#8988A5',
              background: '#fff',
              fontSize: '14px',
              width: '20rem',
              height: '3rem',
            }}
          />
          <Button sx={{ cursor: 'pointer', background: '#1799DE', borderRadius: 62, width: '8rem' }}>Submit</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default PRSection
