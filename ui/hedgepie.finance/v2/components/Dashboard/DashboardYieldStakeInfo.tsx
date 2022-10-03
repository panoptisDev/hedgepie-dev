import React, { useState, useEffect } from 'react'
import { Box, Text } from 'theme-ui'
import YieldStakeDoughnut from './YieldStakeDoughnut'

type Tab = 'yield' | 'stake'
function DashboardYieldStakeInfo() {
  const [activeTab, setActiveTab] = useState<Tab>('yield')
  const [instruments, setInstruments] = useState<any>([])
  useEffect(() => {
    let obj = [
      {
        color: '#F94144',
        title: 'Instrument 1',
        value: '$2,072.81',
      },
      {
        color: '#F3722C',
        title: 'Instrument 2',
        value: '$2,100.34',
      },
      {
        color: '#2D9CDB',
        title: 'Instrument 3',
        value: '$4,172.81',
      },
    ]
    setInstruments(obj)
  }, [])

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
        width: '100%',
        minHeight: '20rem',
        padding: '1.5rem 1.5rem 1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          gap: '20px',
          height: '20rem',
        }}
      >
        {/* Tabs View */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0px', alignItems: 'center' }}>
            <Box
              sx={{
                color: activeTab === 'yield' ? '#1799DE' : '#000000',
                borderBottom: activeTab === 'yield' ? '2px solid #1799DE' : '2px solid #D9D9D9',
                cursor: 'pointer',
                fontFamily: 'Inter',
                padding: '1rem',
              }}
              onClick={() => {
                setActiveTab('yield')
              }}
            >
              <Text sx={{ fontSize: '16px', fontFamily: 'Inter', fontWeight: '600' }}>Total Yield</Text>
            </Box>
            <Box
              sx={{
                color: activeTab === 'stake' ? '#1799DE' : '#000000',
                borderBottom: activeTab === 'stake' ? '2px solid #1799DE' : '2px solid #D9D9D9',
                cursor: 'pointer',
                fontFamily: 'Inter',
                padding: '1rem',
              }}
              onClick={() => {
                setActiveTab('stake')
              }}
            >
              <Text sx={{ fontSize: '16px', fontFamily: 'Inter', fontWeight: '600' }}>Total Staked</Text>
            </Box>
          </Box>
          <Box sx={{ width: '100%', height: '100%', padding: '0.5rem' }}>
            {activeTab === 'yield' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <Text sx={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: '700', color: '#000000' }}>
                    $8,345.62
                  </Text>
                  <Text sx={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: '700', color: '#4F4F4F' }}>
                    10th Aug - 19th Sept, 2022
                  </Text>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {instruments.map((i) => (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                      <Box sx={{ width: '10px', height: '10px', backgroundColor: i.color, borderRadius: '60px' }}></Box>
                      <Text sx={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600' }}>{i.title}</Text>
                      <Text sx={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '400' }}>{i.value}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {activeTab === 'stake' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <Text sx={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: '700', color: '#000000' }}>
                    $24,245.13
                  </Text>
                  <Text sx={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: '700', color: '#4F4F4F' }}>
                    10th Aug - 19th Sept, 2022
                  </Text>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {instruments.map((i) => (
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                      <Box sx={{ width: '10px', height: '10px', backgroundColor: i.color, borderRadius: '60px' }}></Box>
                      <Text sx={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600' }}>{i.title}</Text>
                      <Text sx={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: '400' }}>{i.value}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <YieldStakeDoughnut />
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardYieldStakeInfo
