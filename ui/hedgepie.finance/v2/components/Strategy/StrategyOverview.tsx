import Image from 'next/image'
import React from 'react'
import { ArrowRight } from 'react-feather'
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
          gap: '5px',
          background: '#FFFFFF',
          padding: '0.5rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            border: '1px solid #D9D9D9',
            borderRadius: '16px',
            padding: '0.5rem',
            flex: 1,
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
                  padding: '0.5rem',
                }}
              >
                <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '14px' }}>Pref. Fee</Text>
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
                  padding: '0.5rem',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '14px' }}>APY</Text>
                  <Box sx={{ marginLeft: 'auto', cursor: 'pointer' }}>
                    <Image src="/icons/info.svg" width={20} height={20} />
                  </Box>
                </Box>
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
                  padding: '0.5rem',
                }}
              >
                <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '14px' }}># Investors</Text>
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
                  padding: '0.5rem',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '14px' }}>TVL</Text>
                  <Box sx={{ marginLeft: 'auto', cursor: 'pointer' }}>
                    <Image src="/icons/info.svg" width={20} height={20} />
                  </Box>
                </Box>
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
                  padding: '0.5rem',
                }}
              >
                <Text sx={{ color: '#475569', fontFamily: 'Inter', fontSize: '14px' }}>Your Stake</Text>
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '0.5rem',
            width: '100%',
            flex: 1,
          }}
        >
          <Box
            sx={{
              borderRadius: '8px',
              border: '1px solid #D9D9D9',
              background: '#F3F3F3',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              padding: '0.5rem',
            }}
          >
            <Text sx={{ color: '#14114B', fontWeight: '600', fontFamily: 'Inter', fontSize: '16px' }}>
              Edit History
            </Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px' }}>Recent edit Description</Text>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
                  2 days Ago
                </Text>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px' }}>Recent edit Description</Text>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
                  2 days Ago
                </Text>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px' }}>Recent edit Description</Text>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
                  2 days Ago
                </Text>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', cursor: 'pointer' }}>
                <Text
                  sx={{
                    color: '#1A1A1A',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    fontSize: '12px',
                    ':hover': { textDecorationLine: 'underline' },
                  }}
                >
                  View More
                </Text>
              </Box>
              <Box></Box>
            </Box>
          </Box>
          <Box
            sx={{
              borderRadius: '8px',
              backgroundColor: '#14114B',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#201D54',
                borderRadius: '4px',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}
            >
              <Text sx={{ fontSize: '16px', fontFamily: 'Inter', color: '#94A3B8' }}>Your Yield</Text>
              <Text sx={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'Inter', fontSize: '24px' }}>$5,150</Text>
            </Box>
            <Box sx={{ display: 'flex', gap: '10px', flexDirection: 'row', alignItems: 'center' }}>
              <Box
                sx={{
                  cursor: 'pointer',
                  backgroundColor: '#14114B',
                  color: '#FFFFFF',
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #EFA3C2',
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: 'Inter',
                }}
              >
                CLAIM
              </Box>
              <Box
                sx={{
                  cursor: 'pointer',
                  background: 'linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)',
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: 'Inter',
                }}
              >
                COMPOUND
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default StrategyOverview
