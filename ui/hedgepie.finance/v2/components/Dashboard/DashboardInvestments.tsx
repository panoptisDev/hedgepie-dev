import { useInvestor } from 'hooks/useInvestor'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Box, Button, Spinner, Text } from 'theme-ui'
import { getBalanceInEther } from 'utils/formatBalance'
import { getPrice } from 'utils/getTokenPrice'

function DashboardInvestments() {
  const [investmentsLoading, setInvestmentsLoading] = useState<boolean>(false)
  const [investments, setInvestments] = useState<any[]>([])
  const [invested, setInvested] = useState<number[]>([])
  const [totalYield, setTotalYield] = useState<string>('0.0 BNB')
  const { getBalance, getNFTInfo, getYield } = useInvestor()
  const { getMaxTokenId, getTokenUri } = useYBNFTMint()
  const router = useRouter()

  // START - Integrated Contracts to get Invested Funds

  // START - Get indices of invested tokens
  useEffect(() => {
    const getInvestedFunds = async () => {
      setInvestmentsLoading(true)
      let investedData: number[] = []
      const maxTokenId = await getMaxTokenId()
      for (let i = 1; i <= maxTokenId; i++) {
        const investedInToken = await getBalance(i)
        if (getBalanceInEther(investedInToken) !== getBalanceInEther(0)) {
          investedData.push(i)
        }
      }
      setInvested(investedData)
      if (!invested.length) setInvestmentsLoading(false)
    }
    getInvestedFunds()
  }, [])
  // END - Get indices of invested tokens

  // START - Get investment data for invested tokens
  useEffect(() => {
    if (!invested.length) return
    const getInvestmentData = async () => {
      let investmentData: any[] = []
      for (let index = 0; index < invested.length; index++) {
        const i = invested[index]
        const nftInfo = await getNFTInfo(i)
        const bnbPrice = await getPrice('BNB')
        const tvl = bnbPrice ? `$${Number(getBalanceInEther(nftInfo.tvl) * bnbPrice).toFixed(3)} USD` : 'N/A'
        const totalStaked = `${getBalanceInEther(nftInfo.tvl)} BNB`
        let stake = await getBalance(i)
        let reward = stake === 0.0 ? 0.0 : await getYield(i)
        console.log('invested:' + invested)
        const tokenUri = await getTokenUri(i)
        if (!tokenUri.includes('.ipfs.')) {
          return
        }
        let metadataFile: any = undefined
        try {
          metadataFile = await fetch(tokenUri)
        } catch (err) {
          return
        }
        const metadata = await metadataFile.json()
        let fundObj = {
          index: i,
          instrument: metadata.name,
          totalParticipants: nftInfo.totalParticipant,
          tvl: tvl,
          stake: {
            bnbValue: getBalanceInEther(stake).toFixed(3).toString() + ' BNB',
            usdValue: bnbPrice
              ? `$${
                  getBalanceInEther(stake * bnbPrice)
                    .toFixed(3)
                    .toString() + ' USD'
                }`
              : '',
          },
          apr: '25%',
          yield: {
            bnbValue: getBalanceInEther(reward).toFixed(5).toString() + ' BNB',
            usdValue: bnbPrice
              ? `$${
                  getBalanceInEther(reward * bnbPrice)
                    .toFixed(3)
                    .toString() + ' USD'
                }`
              : '',
          },
        }
        investmentData.push(fundObj)
      }
      setInvestments(investmentData)
      setInvestmentsLoading(false)
    }
    getInvestmentData()
  }, [invested])
  // END - Get investment data for invested tokens

  // START - get total yield

  useEffect(() => {
    if (!invested.length) return
    const calculateTotalYield = async () => {
      let reward = 0
      const bnbPrice = await getPrice('BNB')
      for (let index = 0; index < invested.length; index++) {
        const i = invested[index]
        const rewardForToken = await getYield(i)
        reward = reward + getBalanceInEther(rewardForToken)
      }
      setTotalYield(`$${bnbPrice ? (reward * bnbPrice).toFixed(4) : 0.0} USD`)
    }
    calculateTotalYield()
  }, [invested])

  // END - get total yield

  // END - Integrated Contracts to get Invested Funds

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
      <Box sx={{ display: 'flex', flexDirection: ['column', 'row', 'row', 'row'], alignItems: 'center', gap: '10px' }}>
        <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '24px', color: '#000000' }}>My Investments</Text>
        <Box
          sx={{
            marginLeft: 'auto',
            borderRadius: '8px',
            backgroundColor: '#14114B',
            padding: ['0.5rem', '0.7rem 1.5rem', '0.7rem 1.5rem', '0.7rem 1.5rem'],
            display: 'flex',
            flexDirection: ['column', 'column', 'column', 'row'],
            gap: '15px',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', marginRight: '40px' }}>
            <Text sx={{ color: '#94A3B8', fontSize: '14px' }}>Total Yield:</Text>
            <Text sx={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '600' }}>{totalYield}</Text>
          </Box>
          {/* <Box sx={{ display: 'flex', flexDirection: ['row'], gap: '10px' }}>
            <Box
              sx={{
                cursor: 'pointer',
                backgroundColor: '#14114B',
                color: '#FFFFFF',
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                border: '2px solid #EFA3C2',
                fontSize: ['10px', '14px', '14px', '14px'],
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
                fontSize: ['10px', '14px', '14px', '14px'],
              }}
            >
              COMPOUND ALL
            </Box>
          </Box> */}
        </Box>
      </Box>
      {investmentsLoading && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Spinner />
        </Box>
      )}
      {!investmentsLoading && invested.length > 0 && (
        <Box sx={{ border: '1px solid #D9D9D9', width: '100%', borderRadius: '8px', overflow: 'auto' }}>
          <table style={{ width: '100%', padding: '1rem', borderSpacing: '20px 15px' }}>
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
                {/* <td>Action</td> */}
              </tr>
            </thead>
            <tbody>
              {investments.map((investment) => (
                <tr style={{ textAlign: 'center', color: '#1A1A1A', fontSize: '14px', fontFamily: 'Inter' }}>
                  <td>
                    <Text
                      sx={{
                        fontFamily: 'Inter',
                        fontWeight: '600',
                        color: '#14114B',
                        cursor: 'pointer',
                        ':hover': {
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                          textDecorationThickness: '1px',
                          color: '#17DD',
                        },
                      }}
                      onClick={() => {
                        router.push(`/v2/strategy/?tokenId=${investment.index}`)
                      }}
                    >
                      {investment.instrument}
                    </Text>
                  </td>
                  <td>{investment.tvl}</td>
                  <td>{investment.apr}</td>
                  <td>{investment.totalParticipants}</td>
                  <td>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <Text sx={{ fontFamily: 'Inter', fontWeight: '600' }}>{investment.stake.bnbValue}</Text>
                      <Text sx={{ color: '#8988A5', fontSize: '10px' }}>{investment.stake.usdValue}</Text>
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <Text>{investment.yield.bnbValue}</Text>
                      <Text sx={{ color: '#8988A5', fontSize: '10px' }}>{investment.yield.usdValue}</Text>
                    </Box>
                  </td>
                  {/* <td>
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
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
      {!investmentsLoading && invested.length === 0 && (
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
            You currently have no investments. Explore our{' '}
            <Link href="/nft-leaderboard">
              <Text sx={{ color: '#1799DE', textDecoration: 'underline', cursor: 'pointer' }}>Leaderboard</Text>
            </Link>{' '}
            to invest in a strategy 🎉
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default DashboardInvestments
