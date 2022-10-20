import React, { useEffect, useState } from 'react'
import { Box, Button, Text } from 'theme-ui'

function DashboardInvestments() {
  const [investments, setInvestments] = useState<any>([])
  useEffect(() => {
    let obj = [
      {
        instrument: 'Item 1',
        tvl: '$12,000',
        apr: '25%',
        totalParticipants: '67',
        stake: { bnbValue: '5 BNB', usdValue: '$1526.27' },
        yield: { bnbValue: '3 BNB', usdValue: '$2,060.75' },
        action: '',
      },
      {
        instrument: 'Item 2',
        tvl: '$12,000',
        apr: '25%',
        totalParticipants: '67',
        stake: { bnbValue: '5 BNB', usdValue: '$1526.27' },
        yield: { bnbValue: '3 BNB', usdValue: '$2,060.75' },
        action: '',
      },
      {
        instrument: 'Item 3',
        tvl: '$12,000',
        apr: '25%',
        totalParticipants: '67',
        stake: { bnbValue: '5 BNB', usdValue: '$1526.27' },
        yield: { bnbValue: '3 BNB', usdValue: '$2,060.75' },
        action: '',
      },
    ]
    setInvestments(obj)
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
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '24px', color: '#000000' }}>My Investments</Text>
        <Box
          sx={{
            marginLeft: 'auto',
            borderRadius: '8px',
            backgroundColor: '#14114B',
            padding: '0.7rem 1.5rem',
            display: 'flex',
            flexDirection: 'row',
            gap: '15px',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', marginRight: '40px' }}>
            <Text sx={{ color: '#94A3B8', fontSize: '14px' }}>Total Yield:</Text>
            <Text sx={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600' }}>$8,345.62</Text>
          </Box>
          <Box
            sx={{
              cursor: 'pointer',
              backgroundColor: '#14114B',
              color: '#FFFFFF',
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border: '2px solid #EFA3C2',
            }}
          >
            CLAIM ALL
          </Box>
          <Box
            sx={{
              cursor: 'pointer',
              background: 'linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)',
              color: '#FFFFFF',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
            }}
          >
            COMPOUND ALL
          </Box>
        </Box>
      </Box>
      <Box sx={{ border: ' 1px solid #D9D9D9', width: '100%', borderRadius: '8px' }}>
        <table style={{ width: '100%', padding: '1rem', borderSpacing: '35px 25px' }}>
          <thead>
            <tr
              style={{
                fontWeight: '600',
                fontFamily: 'Inter',
                color: '#1A1A1A',
                fontSize: '16px',
                textAlign: 'center',
              }}
            >
              <td>Instrument</td>
              <td>TVL</td>
              <td>APR</td>
              <td># Participants</td>
              <td>Stake</td>
              <td>Yield</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment) => (
              <tr style={{ textAlign: 'center', color: '#1A1A1A', fontSize: '14px', fontFamily: 'Inter' }}>
                <td>{investment.instrument}</td>
                <td>{investment.tvl}</td>
                <td>{investment.apr}</td>
                <td>{investment.totalParticipants}</td>
                <td>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <Text>{investment.stake.bnbValue}</Text>
                    <Text sx={{ color: '#8988A5', fontSize: '10px' }}>{investment.stake.usdValue}</Text>
                  </Box>
                </td>
                <td>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <Text>{investment.yield.bnbValue}</Text>
                    <Text sx={{ color: '#8988A5', fontSize: '10px' }}>{investment.yield.usdValue}</Text>
                  </Box>
                </td>
                <td>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '10px',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <Button
                      sx={{
                        borderRadius: '4px',
                        boxShadow: '0px 2px 3px rgba(133, 175, 197, 0.3)',
                        border: '1px solid #8BCCEE',
                        backgroundColor: '#F2F9FD',
                        color: '#1A1A1A',
                        fontFamily: 'Inter',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginLeft: '20px',
                      }}
                    >
                      CLAIM
                    </Button>
                    <Button
                      sx={{
                        borderRadius: '4px',
                        boxShadow: '0px 2px 3px rgba(133, 175, 197, 0.3)',
                        border: '1px solid #8BCCEE',
                        backgroundColor: '#F2F9FD',
                        color: '#1A1A1A',
                        fontFamily: 'Inter',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      COMPOUND
                    </Button>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  )
}

export default DashboardInvestments
