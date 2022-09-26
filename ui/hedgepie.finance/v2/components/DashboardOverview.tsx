import moment from 'moment'
import React from 'react'
import { ArrowRight } from 'react-feather'
import { Box, Text } from 'theme-ui'

function DashboardOverview() {
  const date = moment().format('DD/MM/yyyy')
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title Section */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '24px', color: '#000000' }}>Overview</Text>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px', marginLeft: 'auto' }}>
          <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '16px', color: '#000000' }}>Date:</Text>
          <Text>{date}</Text>
        </Box>
      </Box>
      {/* Overall Statistics and Chart */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '30px', minHeight: '20rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '8px',
              backgroundColor: '#14114B',
              padding: '1rem',
              gap: '14px',
              width: '100%',
            }}
          >
            <Text sx={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>
              Total Invested
            </Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              <Text sx={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>$5,987.20</Text>
              <Text sx={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: '400', color: '#8BCCEE' }}>$5,987.20</Text>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1.06471px solid #D9D9D9',
              padding: '1rem',
              gap: '14px',
              width: '100%',
            }}
          >
            <Text sx={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', color: '#4F4F4F' }}>Total Yield</Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              <Text sx={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600', color: '#000000' }}>$0</Text>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1.06471px solid #D9D9D9',
              padding: '1rem',
              gap: '14px',
              width: '100%',
            }}
          >
            <Text sx={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', color: '#4F4F4F' }}>
              Unclaimed Yield
            </Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              <Text sx={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600', color: '#000000' }}>$0</Text>
            </Box>
          </Box>
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'row',
              borderRadius: '8px',
              border: '3px solid #D9D9D9',
              alignItems: 'center',
            }}
          >
            <Text sx={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>Explore</Text>
            <ArrowRight style={{ width: '20px', height: '20px', marginLeft: 'auto' }} />
          </Box>
        </Box>
        <Box
          sx={{
            flex: 3,
            borderRadius: '8px',
            boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
            border: '2px solid #14114B',
            height: '100%',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '25px', margin: '2rem 1rem', height: '18rem' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '25px', alignItems: 'center' }}>
              <Text sx={{ color: '#000000', fontSize: '16px', fontWeight: '600', fontFamily: 'Inter' }}>
                Total Invested
              </Text>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <Box sx={{ backgroundColor: '#14114B', color: '#FFFFFF', padding: '0.5rem', borderRadius: '8px' }}>
                  ALL TIME
                </Box>
                <Box sx={{ backgroundColor: '#F3F3F3', color: '#000000', padding: '0.5rem', borderRadius: '8px' }}>
                  90D
                </Box>
                <Box sx={{ backgroundColor: '#F3F3F3', color: '#000000', padding: '0.5rem', borderRadius: '8px' }}>
                  1M
                </Box>
              </Box>
              <Text sx={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: '600', marginLeft: 'auto' }}>$5,987</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardOverview
