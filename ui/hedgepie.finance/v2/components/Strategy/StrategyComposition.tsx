import Image from 'next/image'
import React from 'react'
import { Box, Text } from 'theme-ui'
import YieldStakeDoughnut from '../Dashboard/YieldStakeDoughnut'

function StrategyComposition() {
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
        padding: '1rem 2rem',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text sx={{ color: '#14114B', fontSize: '20px', fontWeight: '600', fontFamily: 'Inter' }}>
          Strategy Composition
        </Text>
        <Box
          sx={{
            backgroundColor: '#F3F3F3',
            borderRadius: '4px',
            padding: '0.5rem',
            marginLeft: 'auto',
            cursor: 'pointer',
          }}
        >
          <Image src="/icons/edit_square.svg" width={20} height={20} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', width: '100%' }}>
        <Box sx={{ border: '1px solid #E3E3E3', borderRadius: '4px', flex: 2 }}>
          <table style={{ width: '100%', borderSpacing: '1rem 2rem' }}>
            <thead>
              <tr style={{ fontFamily: 'Inter', fontWeight: '600' }}>
                <td>Protocol</td>
                <td>Tokens</td>
                <td>Pool Value</td>
                <td>APR</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ApeSwap</td>
                <td>ETH/AKRO</td>
                <td>$120,505</td>
                <td>12%</td>
              </tr>
              <tr>
                <td>AutoFarm</td>
                <td>BNB/AKRO</td>
                <td>$120,505</td>
                <td>12%</td>
              </tr>
              <tr>
                <td>Alpaca</td>
                <td>ETH/DAI</td>
                <td>$120,505</td>
                <td>12%</td>
              </tr>
            </tbody>
          </table>
        </Box>
        <Box
          sx={{
            border: '1px solid #E3E3E3',
            borderRadius: '4px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
          }}
        >
          <Text sx={{ color: '#14114B', fontSize: '16px', fontWeight: '600', fontFamily: 'Inter' }}>Weight</Text>
          <Box
            sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}
          >
            <YieldStakeDoughnut />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default StrategyComposition
