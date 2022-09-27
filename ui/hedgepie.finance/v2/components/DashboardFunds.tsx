import React, { useState } from 'react'
import { Box, Text } from 'theme-ui'

function DashboardFunds() {
  const [funds, setFunds] = useState(['', '', ''])
  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
        width: '100%',
        minHeight: '20rem',
        padding: '2.5rem 1.5rem 1.5rem 1.5rem',
      }}
    >
      <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '24px', color: '#000000' }}>My Strategies</Text>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '15px',
          marginTop: '15px',
        }}
      >
        {funds.map((f) => (
          <Box sx={{ borderRadius: '8px', border: '1px solid #D9D9D9' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '30px', padding: '1rem', alignItems: 'center' }}>
              <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: '#000000' }}>Fund XYZ</Text>
              <Box
                sx={{
                  borderRadius: '4px',
                  backgroundColor: '#F3F3F3',
                  padding: '0.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '8px', color: '#4D4D4D' }}>Created:</Text>
                <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '10px', color: '#4D4D4D' }}>
                  04/09/2022
                </Text>
              </Box>
              <Box
                sx={{
                  borderRadius: '4px',
                  backgroundColor: '#F3F3F3',
                  padding: '0.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '8px', color: '#4D4D4D' }}>
                  Last Updated:
                </Text>
                <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '10px', color: '#4D4D4D' }}>2d ago</Text>
              </Box>
            </Box>
            <Box sx={{ height: '2px', backgroundColor: '#D9D9D9', width: '100%' }}></Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0.5rem 1rem 1rem 1rem' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}>
                    Investors:
                  </Text>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}>20</Text>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}>TVL:</Text>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}>
                    $258,203
                  </Text>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}>
                    Stake:
                  </Text>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}>20</Text>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}>APY:</Text>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}>
                    $258,203
                  </Text>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}>
                    Yield:
                  </Text>
                  <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}>
                    $258,203
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default DashboardFunds
