import { useWeb3React } from '@web3-react/core'
import { useInvestor } from 'hooks/useInvestor'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { Box, Spinner, Text } from 'theme-ui'
import { getBalanceInEther } from 'utils/formatBalance'
import { getPrice } from 'utils/getTokenPrice'

function StrategyOverview(props: { tokenId: number }) {
  const { tokenId } = props
  const [loading, setLoading] = useState(false)
  const [fundName, setFundName] = useState('')
  const [createdDate, setCreatedDate] = useState('14/09/2022')
  const [description, setDescription] = useState(
    'Descriptive text for the Fund goes here. Any relevant information will be displayed.',
  )
  const [performanceFee, setPerformanceFee] = useState('5.15%')
  const [reward, setReward] = useState('$5,150')
  const [stake, setStake] = useState('15 BNB')
  const [stakeUSD, setStakeUSD] = useState('$10,580 USD')
  const [tvl, setTVL] = useState('$245,301')
  const [apy, setAPY] = useState('12%')
  const [investors, setInvestors] = useState('400')

  const { getNFTInfo, getYield, getBalance } = useInvestor()
  const { getTokenUri, getPerfFee } = useYBNFTMint()
  const { account } = useWeb3React()

  useEffect(() => {
    setLoading(true)
    if (!tokenId) return
    const fetchOverview = async () => {
      const nftInfo = await getNFTInfo(tokenId)
      const bnbPrice = await getPrice('BNB')
      const tvl = bnbPrice ? `$ ${Number(getBalanceInEther(nftInfo.tvl) * bnbPrice).toFixed(3)} USD` : 'N/A'
      const totalStaked = `${getBalanceInEther(nftInfo.tvl)} BNB`
      const totalParticipants = nftInfo.totalParticipant
      let invested = await getBalance(tokenId)
      console.log('Invested 123 : ' + invested)
      let reward = Number(invested) !== 0 ? await getYield(tokenId) : 0.0
      console.log('Reward')
      let perfFee = await getPerfFee(tokenId)
      console.log('invested:' + invested)
      const tokenUri = await getTokenUri(tokenId)
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

      // Setting the State Variables
      setFundName(metadata.name)
      setDescription(metadata.description)
      setTVL(tvl)
      setStake(`${getBalanceInEther(Number(invested))} BNB`)
      setStakeUSD(`$${(getBalanceInEther(Number(invested)) * (bnbPrice ? bnbPrice : 0)).toFixed(3)} USD`)

      setReward(`${getBalanceInEther(Number(reward)).toFixed(5)} BNB`)
      setInvestors(totalParticipants)
      setPerformanceFee(`${perfFee / 100} %`)
      setLoading(false)
    }
    account && fetchOverview()
  }, [tokenId, account])

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
        {loading ? (
          <Box
            sx={{ height: '10rem', width: '10rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Spinner />
          </Box>
        ) : (
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
              <Text sx={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '20px', color: '#000000' }}>
                {fundName}
              </Text>
              <Text
                sx={{ fontFamily: 'Inter', fontWeight: '500', fontSize: '16px', color: '#4F4F4F', marginLeft: 'auto' }}
              >
                Created: {createdDate}
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
                {description}
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
                  <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{performanceFee}</Text>
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
                  <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{apy}</Text>
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
                  <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{investors}</Text>
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
                  <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{tvl}</Text>
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
                    <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{stake}</Text>
                    <Text sx={{ color: '#DF4886', fontWeight: '500', fontSize: '14px', marginLeft: '3px' }}>
                      {stakeUSD}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
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
              <Text sx={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'Inter', fontSize: '24px' }}>{reward}</Text>
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
