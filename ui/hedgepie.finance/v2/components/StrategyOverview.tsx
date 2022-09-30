import React from 'react'
import { Box, Text } from 'theme-ui'

function StrategyOverview() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title Section */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text sx={{ fontFamily: 'Inter', fontWeight: '500', fontSize: '20px', color: '#000000' }}>Overview/</Text>
        <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '24px', color: '#000000' }}>
          Strategy Details
        </Text>
      </Box>
      <Box
        sx={{
          borderRadius: '16px',
          boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid #D9D9D9',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          minHeight: '25rem',
          background: '#FFFFFF',
          padding: '1rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1px solid #D9D9D9',
            boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            padding: '1rem',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '1rem' }}>
            <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '20px', color: '#000000' }}>Fund XYZ</Text>
            <Text
              sx={{ fontFamily: 'Inter', fontWeight: '500', fontSize: '16px', color: '#4F4F4F', marginLeft: 'auto' }}
            >
              Created: 14/09/2022
            </Text>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              height: '3px',
              backgroundColor: '#D9D9D9',
            }}
          ></Box>
          <Box sx={{ maxWidth: '28rem' }}>
            <Text sx={{ fontFamily: 'Inter', fontWeight: '500', fontSize: '16px', color: '#4F4F4F' }}>
              Descriptive text for the Fund goes here. Any relevant information will be displayed.
            </Text>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  backgroundColor: '#F3F3F3',
                  borderRadius: '4px',
                  padding: '1rem',
                }}
              >
                <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '12px' }}>Pref. Fee</Text>
                <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>5.5%</Text>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  backgroundColor: '#F3F3F3',
                  borderRadius: '4px',
                  padding: '1rem',
                }}
              >
                <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '12px' }}>APY</Text>
                <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>12%</Text>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  backgroundColor: '#F3F3F3',
                  borderRadius: '4px',
                  padding: '1rem',
                }}
              >
                <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '12px' }}># Investors</Text>
                <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>150</Text>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  backgroundColor: '#F3F3F3',
                  borderRadius: '4px',
                  padding: '1rem',
                }}
              >
                <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '12px' }}>TVL</Text>
                <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>$100,345</Text>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  backgroundColor: '#F3F3F3',
                  borderRadius: '4px',
                  padding: '1rem',
                }}
              >
                <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '12px' }}>Your Stake</Text>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>15 BNB</Text>
                  <Text sx={{ color: '#DF4886', fontWeight: '500', fontSize: '14px', marginLeft: '3px' }}>
                    $10,580.42
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default StrategyOverview
