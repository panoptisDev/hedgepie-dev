import React, { useEffect, useState } from 'react'
import { Box, ThemeUICSSObject, Spinner } from 'theme-ui'
import LotterySearch from './LotterySearch'
import LotteryTable from './LotteryTable'
import LotteryLoad from './LotteryLoad'

import { useYBNFTMint } from 'hooks/useYBNFTMint'

import { styles } from './styles'

export interface TokenInfo {
  name: string
  imageURL?: string
  description?: string
  tokenId: number
}

const testData = [
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB1',
    name: 'hqwgf',
    symbol: 'hqwgf',
    pie: '/images/pie.png',
    tvl: 241431,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 66.3,
    profit: 13658,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB2',
    name: 'epiqe',
    symbol: 'hqwgf',
    pie: '/images/pie.png',
    tvl: 241331,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 54.5,
    profit: 27135,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB3',
    name: 'uhkwt',
    symbol: 'uhkwt',
    pie: '/images/pie.png',
    tvl: 241416,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 14.8,
    profit: 39795,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB4',
    name: 'nlvag',
    symbol: 'nlvag',
    pie: '/images/pie.png',
    tvl: 241521,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 24.4,
    profit: 59546,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB5',
    name: 'bzbad',
    symbol: 'bzbad',
    pie: '/images/pie.png',
    tvl: 226431,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 65.2,
    profit: 94457,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB6',
    name: 'cvbab',
    symbol: 'cvbab',
    pie: '/images/pie.png',
    tvl: 237831,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 97.5,
    profit: 72648,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB7',
    name: 'zlczb',
    symbol: 'cvbab',
    pie: '/images/pie.png',
    tvl: 845431,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 23.1,
    profit: 42669,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB8',
    name: 'vljee',
    symbol: 'cvbab',
    pie: '/images/pie.png',
    tvl: 747231,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 57.4,
    profit: 52345,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C10D4EB9',
    name: 'dalzc',
    symbol: 'dalzc',
    pie: '/images/pie.png',
    tvl: 882431,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 44.5,
    profit: 82385,
  },
  {
    address: '0xbe80CC729fa73A8B8e651A5546e201b4C20D4EBd',
    name: 'dsksa',
    symbol: 'dsksa',
    pie: '/images/pie.png',
    tvl: 147331,
    staked: 807073,
    participants: 12658,
    daily: 0.14,
    apy: 24.4,
    profit: 32478,
  },
]

const LeaderBoard = () => {
  const [lotteries, setLotteries] = React.useState([] as TokenInfo[])
  const [searchKey, setSearchKey] = React.useState('')
  const [sortKey, setSortKey] = React.useState('')
  const { getMaxTokenId, getTokenUri } = useYBNFTMint()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true)
      const maxTokenId = await getMaxTokenId()
      console.log('max token id' + maxTokenId)
      let tokens = [] as TokenInfo[]
      for (let i = 1; i <= maxTokenId; i++) {
        const tokenUri = await getTokenUri(i)
        // Is the link is invalid, just proceed
        if (!tokenUri.includes('.ipfs.')) {
          continue
        }
        const metadataFile = await fetch(tokenUri)
        const metadata = await metadataFile.json()
        const leaderboardItem = {
          tokenId: i,
          name: metadata.name,
          imageURL: metadata.imageURL,
          description: metadata.description,
        }
        tokens.push(leaderboardItem)
      }
      setLotteries(tokens)
      setLoading(false)
    }
    fetchLeaderboardData()
  }, [])

  const handleSearch = (key: string) => {
    setSearchKey(key)
  }

  const handleLoad = (data: any) => {
    setLotteries([...lotteries, ...data])
  }

  const handleSort = (key: string) => {
    setSortKey(key === sortKey ? '' : key)
  }

  const filtered = lotteries.filter((d) => {
    return (
      (d.description && d.description.toLowerCase().includes(searchKey.toLowerCase())) ||
      (d.name && d.name.toLowerCase().includes(searchKey.toLowerCase()))
    )
  })

  const sorted = filtered.sort((a: any, b: any) => {
    if (sortKey !== '') {
      return a[sortKey] > b[sortKey] ? 1 : -1
    }
    return 0
  })

  return (
    <Box sx={styles.leaderboard_container as ThemeUICSSObject}>
      {loading ? (
        <Spinner />
      ) : (
        <Box sx={styles.leaderboard_inner_container as ThemeUICSSObject}>
          <LotterySearch onSearch={handleSearch} />
          <LotteryTable data={sorted} onSort={handleSort} sortKey={sortKey} />
          {/* <LotteryLoad onLoad={handleLoad} /> */}
        </Box>
      )}
    </Box>
  )
}

export default LeaderBoard
