import { useInvestor } from 'hooks/useInvestor'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import moment from 'moment'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { ArrowRight } from 'react-feather'
import { Box, Spinner, Text } from 'theme-ui'
import { getBalanceInEther } from 'utils/formatBalance'
import { getPrice } from 'utils/getTokenPrice'
import DashboardInvestmentChart from './DashboardInvestmentChart'

function DashboardOverview() {
  const router = useRouter()
  const date = moment().format('DD/MM/yyyy')

  const [totalInvestedLoading, setTotalInvestedLoading] = useState<boolean>(false)
  const [totalInvested, setTotalInvested] = useState<string>()
  const [totalInvestedUSD, setTotalInvestedUSD] = useState<string>()

  const [totalYieldLoading, setTotalYieldLoading] = useState<boolean>(false)
  const [totalYield, setTotalYield] = useState<string>()
  const [totalYieldUSD, setTotalYieldUSD] = useState<string>()
  const [unclaimedYield, setUnclaimedYield] = useState('$0')

  const { getBalance, getYield } = useInvestor()
  const { getMaxTokenId } = useYBNFTMint()

  // START =  To Interact with contracts and get total Invested and Total Yield

  // START = Total Invested
  useEffect(() => {
    const calculateTotalInvested = async () => {
      setTotalInvestedLoading(true)
      const maxTokenId = await getMaxTokenId()
      let invested = 0
      const bnbPrice = await getPrice('BNB')
      for (let i = 1; i <= maxTokenId; i++) {
        let investedInToken = await getBalance(i)
        invested = invested + getBalanceInEther(investedInToken)
      }
      setTotalInvested(invested.toFixed(3).toString() + ' BNB')
      bnbPrice && setTotalInvestedUSD(`$${(invested * bnbPrice).toFixed(3).toString()} USD`)
      setTotalInvestedLoading(false)
    }
    calculateTotalInvested()
  }, [])
  // END = Total Invested

  // START = Total Yield
  useEffect(() => {
    const calculateTotalYield = async () => {
      setTotalYieldLoading(true)
      const maxTokenId = await getMaxTokenId()
      let reward = 0
      const bnbPrice = await getPrice('BNB')
      for (let i = 1; i <= maxTokenId; i++) {
        let investedInToken = await getBalance(i)
        if (investedInToken == 0.0) {
          continue
        }
        let rewardInToken = await getYield(i)
        reward = reward + getBalanceInEther(rewardInToken)
      }
      setTotalYield(reward.toFixed(5).toString() + ' BNB')
      bnbPrice && setTotalYieldUSD(`$${(reward * bnbPrice).toFixed(4).toString()} USD`)
      setTotalYieldLoading(false)
    }
    calculateTotalYield()
  }, [])
  // END = Total Yield

  // END = To Interact with contracts and get total Invested and Total Yield

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
      <Box
        sx={{
          display: 'flex',
          flexDirection: ['column', 'column', 'column', 'row'],
          alignItems: 'center',
          gap: '30px',
          minHeight: '20rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: ['row', 'column', 'column', 'column'],
            alignItems: 'center',
            gap: '10px',
            flex: 1,
          }}
        >
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
              height: ['100%', 'max-content', 'max-content', 'max-content'],
            }}
          >
            <Text
              sx={{
                fontFamily: 'Inter',
                fontSize: ['10px', '12px', '12px', '12px'],
                fontWeight: '500',
                color: '#94A3B8',
              }}
            >
              Total Invested
            </Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              {totalInvestedLoading ? (
                <Spinner />
              ) : (
                <>
                  <Text
                    sx={{
                      fontFamily: 'Inter',
                      fontSize: ['12px', '16px', '16px', '16px'],
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}
                  >
                    {totalInvested}
                  </Text>
                  <Text sx={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: '400', color: '#8BCCEE' }}>
                    {totalInvestedUSD}
                  </Text>
                </>
              )}
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
              height: ['100%', 'max-content', 'max-content', 'max-content'],
            }}
          >
            <Text
              sx={{
                fontFamily: 'Inter',
                fontSize: ['10px', '12px', '12px', '12px'],
                fontWeight: '600',
                color: '#4F4F4F',
              }}
            >
              Total Yield
            </Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              {totalYieldLoading ? (
                <Spinner />
              ) : (
                <>
                  <Text
                    sx={{
                      fontFamily: 'Inter',
                      fontSize: ['12px', '16px', '16px', '16px'],
                      fontWeight: '600',
                      color: '#000000',
                    }}
                  >
                    {totalYield}
                  </Text>
                  <Text sx={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: '400', color: '#000000' }}>
                    {totalYieldUSD}
                  </Text>
                </>
              )}
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
              height: ['100%', 'max-content', 'max-content', 'max-content'],
            }}
          >
            <Text
              sx={{
                fontFamily: 'Inter',
                fontSize: ['10px', '12px', '12px', '12px'],
                fontWeight: '600',
                color: '#4F4F4F',
              }}
            >
              Unclaimed Yield
            </Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              <Text
                sx={{
                  fontFamily: 'Inter',
                  fontSize: ['12px', '16px', '16px', '16px'],
                  fontWeight: '600',
                  color: '#000000',
                }}
              >
                $0
              </Text>
            </Box>
          </Box>
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              padding: '1rem',
              display: ['none', 'flex', 'flex', 'flex'],
              flexDirection: 'row',
              borderRadius: '8px',
              border: '2px solid #EFA3C2',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => {
              router.push('/nft-leaderboard')
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
                margin: '1rem 1rem',
                height: '18rem',
                padding: '0rem 0.75rem',
              }}
            >
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
                <Text sx={{ fontFamily: 'Inter', fontSize: '24px', fontWeight: '600', marginLeft: 'auto' }}>
                  $5,987
                </Text>
              </Box>
              <Box sx={{ width: '100%', height: '100%' }}>
                <DashboardInvestmentChart />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardOverview
