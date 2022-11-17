import { useWeb3React } from '@web3-react/core'
import { useInvestor } from 'hooks/useInvestor'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Box, Button, Spinner, Text } from 'theme-ui'
import { getBalanceInEther } from 'utils/formatBalance'
import { getPrice } from 'utils/getTokenPrice'

function DashboardFunds() {
  const { getOwnerOf } = useYBNFTMint()
  const { account } = useWeb3React()
  const [owned, setOwned] = useState<number[]>([])
  const [funds, setFunds] = useState<any[]>([])
  const [fundsLoading, setFundsLoading] = useState<boolean>(false)

  const { getMaxTokenId, getTokenUri } = useYBNFTMint()
  const { getNFTInfo, getBalance, getYield } = useInvestor()
  const router = useRouter()

  // START - Interaction with Contracts

  // START - Get all token IDs minted by account
  useEffect(() => {
    const getOwnedYBNFTS = async () => {
      const maxTokenId = await getMaxTokenId()
      let ownedNFTs: number[] = []
      for (let i = 1; i <= maxTokenId; i++) {
        if (process.env.DUMMY_TOKENS && Array.from(JSON.parse(process.env.DUMMY_TOKENS))?.indexOf(i) !== -1) continue
        const owner = await getOwnerOf(i)
        if (owner === account) ownedNFTs.push(i)
      }
      setOwned(ownedNFTs)
    }
    getOwnedYBNFTS()
  }, [])
  // END - Get all token IDs minted by account

  // START - Get info of tokens owned by user
  useEffect(() => {
    if (!owned.length) return
    const fetchFundsData = async () => {
      setFundsLoading(true)
      let fundData: any[] = []
      for (let index = 0; index < owned.length; index++) {
        let i = owned[index]

        const nftInfo = await getNFTInfo(i)
        const bnbPrice = await getPrice('BNB')
        const tvl = bnbPrice ? `$${Number(getBalanceInEther(nftInfo.tvl) * bnbPrice).toFixed(3)} USD` : 'N/A'
        const totalStaked = `${getBalanceInEther(nftInfo.tvl)} BNB`
        let reward = await getYield(i)
        let invested = await getBalance(i)
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
          name: metadata.name,
          investors: nftInfo.totalParticipant,
          tvl: tvl,
          stake: getBalanceInEther(invested).toFixed(3).toString() + ' BNB',
          apy: '15%',
          yield: getBalanceInEther(reward).toFixed(5).toString() + ' BNB',
        }
        fundData.push(fundObj)
      }

      setFunds(fundData)
      setFundsLoading(false)
    }
    fetchFundsData()
  }, [owned])
  // END - Get info of tokens owned by user

  // END - Interaction with Contracts
  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
        width: '100%',
        minHeight: '18rem',
        padding: '1.5rem 1.5rem 1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '24px', color: '#000000' }}>
        My Strategies
      </Text>
      {fundsLoading ? (
        <Box sx={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </Box>
      ) : null}
      {!fundsLoading && funds.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: ['column', 'column', 'column', 'row'],
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '15px',
            marginTop: '15px',
          }}
        >
          <>
            {funds.map((f) => (
              <Box
                sx={{ borderRadius: '8px', border: '1px solid #D9D9D9', cursor: 'pointer' }}
                onClick={() => {
                  router.push(`/v2/strategy/?tokenId=${f.index}`)
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '30px', padding: '1rem', alignItems: 'center' }}>
                  <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '16px', color: '#000000' }}>
                    {f.name}
                  </Text>
                  {/* <Box
                    sx={{
                      borderRadius: '4px',
                      backgroundColor: '#F3F3F3',
                      padding: '0.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '8px', color: '#4D4D4D' }}>
                      Created:
                    </Text>
                    <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '10px', color: '#4D4D4D' }}>
                      {f.createdDate}
                    </Text>
                  </Box>
                  <Box
                    sx={{
                      borderRadius: '4px',
                      backgroundColor: '#F3F3F3',
                      padding: '0.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '8px', color: '#4D4D4D' }}>
                      Last Updated:
                    </Text>
                    <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '10px', color: '#4D4D4D' }}>
                      {f.lastUpdated}
                    </Text>
                  </Box> */}
                </Box>
                <Box sx={{ height: '2px', backgroundColor: '#D9D9D9', width: '100%' }}></Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0.5rem 1rem 1rem 1rem' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}
                      >
                        Investors:
                      </Text>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}
                      >
                        {f.investors}
                      </Text>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}
                      >
                        TVL:
                      </Text>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}
                      >
                        {f.tvl}
                      </Text>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}
                      >
                        Stake:
                      </Text>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}
                      >
                        {f.stake}
                      </Text>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}
                      >
                        APY:
                      </Text>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}
                      >
                        {f.apy}
                      </Text>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '12px', color: '#4F4F4F' }}
                      >
                        Yield:
                      </Text>
                      <Text
                        sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '16px', color: '#1A1A1A' }}
                      >
                        {f.yield}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </>
        </Box>
      ) : null}
      {!fundsLoading && !funds.length && (
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
          <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px', color: '#14114B', fontWeight: '600' }}>
            You currently do not have any Minted Strategies. Please Create a strategy to view it here.
          </Text>
        </Box>
      )}
      <Button
        sx={{
          color: '#FFFFFF',
          backgroundColor: '#1799DE',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          gap: '15px',
          width: ['100%', '10rem', '10rem', '15rem'],
          height: '3rem',
          marginTop: '1rem',
          cursor: 'pointer',
        }}
        onClick={() => router.push('/mint')}
      >
        <Text sx={{ fontSize: '26px' }}>+</Text>
        <Text sx={{ fontSize: '16px' }}>ADD STRATEGY</Text>
      </Button>
    </Box>
  )
}

export default DashboardFunds
