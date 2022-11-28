import React, { useState, useEffect } from 'react'
import { useInvestor } from 'hooks/useInvestor'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import { Box, Spinner } from 'theme-ui'
import fetchTotalProfit from 'utils/totalProfit'
import { getPrice } from 'utils/getTokenPrice'
import { getBalanceInEther } from 'utils/formatBalance'
import LeaderBoardItem from './LeaderBoardItem'

export interface TokenInfo {
  name?: string
  imageURL?: string
  description?: string
  tokenId?: number
  tvl?: string
  totalStaked?: string
  totalParticipants?: number
  totalProfit?: string
}

function LeaderboardContent() {
  const [lotteries, setLotteries] = React.useState([] as TokenInfo[])

  const { getMaxTokenId, getTokenUri } = useYBNFTMint()
  const { getNFTInfo } = useInvestor()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLotteries([])
    const fetchLeaderboardData = async () => {
      setLoading(true)
      const maxTokenId = await getMaxTokenId()
      let profit = await fetchTotalProfit()
      console.log('profit' + JSON.stringify(profit))
      let profitMap = {} as any
      profit &&
        profit.forEach((p) => {
          let nftId = Number(p[1])
          let val = parseInt(p[2])
          profitMap[nftId] = profitMap[nftId] ? profitMap[nftId] + val : val
        })

      let tokens = [] as TokenInfo[]
      for (let i = 1; i <= maxTokenId; i++) {
        if (process.env.DUMMY_TOKENS && Array.from(JSON.parse(process.env.DUMMY_TOKENS))?.indexOf(i) !== -1) continue
        const tokenUri = await getTokenUri(i)
        // Is the link is invalid, just proceed
        if (!tokenUri.includes('.ipfs.')) {
          continue
        }
        console.log('Token::' + tokenUri)
        let metadataFile: any = undefined
        try {
          metadataFile = await fetch(tokenUri)
        } catch (err) {
          continue
        }
        console.log('metadataFile' + JSON.stringify(metadataFile))
        if (metadataFile == null) {
          continue
        }

        // Obtain total participants and TVL, Will be used to populate the tvl and participants in the Leaderboard
        const nftInfo = await getNFTInfo(i)
        const bnbPrice = await getPrice('BNB')
        const tvl = bnbPrice ? `$${Number(getBalanceInEther(nftInfo.tvl) * bnbPrice).toFixed(3)} USD` : 'N/A'
        const totalStaked = `${getBalanceInEther(nftInfo.tvl).toFixed(4)} BNB`
        const totalProfit =
          bnbPrice && profitMap[i] ? `$${Number(getBalanceInEther(profitMap[i]) * bnbPrice).toFixed(3)} USD` : 'N/A'
        const metadata = await metadataFile.json()
        const leaderboardItem = {
          tokenId: i,
          name: metadata.name,
          imageURL: metadata.imageURL,
          description: metadata.description,
          tvl: tvl,
          totalStaked: totalStaked,
          totalParticipants: nftInfo.totalParticipant,
          totalProfit: totalProfit,
        }
        tokens.push(leaderboardItem)
        setLotteries(tokens)
      }
      setLotteries(tokens)
      console.log('setting loading false')
      setLoading(false)
    }
    fetchLeaderboardData()
  }, [])
  return (
    <Box sx={{ display: 'flex', padding: '2rem', gap: '20px', flexDirection: 'row', width: '100%', flexWrap: 'wrap' }}>
      {loading ? (
        <Box sx={{ width: '100%', height: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner />
        </Box>
      ) : (
        <>
          {lotteries.map((item) => (
            <LeaderBoardItem item={item} />
          ))}
        </>
      )}
    </Box>
  )
}

export default LeaderboardContent
