import React, { useState } from 'react'
import { Box, Text } from 'theme-ui'
import DashboardInvestmentChart from '../Dashboard/DashboardInvestmentChart'

type TabType = 'apy' | 'tvl' | 'investors'
function StrategyCharts(props: { tokenId: number }) {
  const [activeTab, setActiveTab] = useState('apy')
  return (
    <Box
      sx={{
        borderRadius: '16px',
        boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
        border: '1px solid #D9D9D9',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        background: '#FFFFFF',
        padding: '1rem',
        minHeight: '25rem',
      }}
    >
      {true ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '25px',
            margin: '1rem 1rem',
            height: '18rem',
            padding: '0rem 0.75rem',
          }}
        >
          <Text sx={{ fontFamily: 'Inter', fontSize: '20px', color: '#14114B', fontWeight: '600' }}>
            Insights of your Historic data shall appear here soon 🎉
          </Text>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '50px', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0px', alignItems: 'center' }}>
              <Box
                sx={{
                  color: activeTab === 'apy' ? '#1799DE' : '#000000',
                  borderBottom: activeTab === 'apy' ? '2px solid #1799DE' : '2px solid #D9D9D9',
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                  padding: '1.5rem',
                }}
                onClick={() => {
                  setActiveTab('apy')
                }}
              >
                <Text sx={{ fontSize: '16px', fontFamily: 'Inter', fontWeight: '600' }}>APY</Text>
              </Box>
              <Box
                sx={{
                  color: activeTab === 'tvl' ? '#1799DE' : '#000000',
                  borderBottom: activeTab === 'tvl' ? '2px solid #1799DE' : '2px solid #D9D9D9',
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                  padding: '1.5rem',
                }}
                onClick={() => {
                  setActiveTab('tvl')
                }}
              >
                <Text sx={{ fontSize: '16px', fontFamily: 'Inter', fontWeight: '600' }}>TVL</Text>
              </Box>
              <Box
                sx={{
                  color: activeTab === 'investors' ? '#1799DE' : '#000000',
                  borderBottom: activeTab === 'investors' ? '2px solid #1799DE' : '2px solid #D9D9D9',
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                  padding: '1.5rem',
                }}
                onClick={() => {
                  setActiveTab('investors')
                }}
              >
                <Text sx={{ fontSize: '16px', fontFamily: 'Inter', fontWeight: '600' }}>No of Investors</Text>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center' }}>
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
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '1rem' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <Text sx={{ fontWeight: '600', fontSize: '26px', fontFamily: 'Inter' }}>5%</Text>
              <Text sx={{ fontWeight: '400', fontSize: '16px', fontFamily: 'Inter', color: '#666666' }}>
                Current APY
              </Text>
            </Box>
            <Box sx={{ width: '100%', height: '100%' }}>
              <DashboardInvestmentChart />
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}

export default StrategyCharts
