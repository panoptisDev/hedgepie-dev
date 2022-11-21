import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { ArrowRight, Heart } from 'react-feather'
import { Box, Image, Text } from 'theme-ui'
import { TokenInfo } from 'v2/components/Leaderboard/LeaderboardContent'

interface LeaderboardItemProps {
  item: TokenInfo
}

function LeaderBoardItem(props: LeaderboardItemProps) {
  const { item } = props
  const [liked, setLiked] = useState(false)
  const router = useRouter()

  const renderStatistic = (label: string, value: string | undefined) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
        <Text sx={{ color: '#4F4F4F', fontWeight: '600', fontSize: '14px' }}>{label}:</Text>
        {value ? <Text sx={{ color: '#4F4F4F', fontWeight: '400', fontSize: '14px' }}>{value}</Text> : null}
      </Box>
    )
  }

  const renderTag = (tag: string) => {
    return (
      <Box
        sx={{
          backgroundColor: '#F3F3F3',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '5px',
        }}
      >
        <Text sx={{ color: '#4F4F4F', fontWeight: '500', fontSize: '12px' }}>{tag}</Text>
      </Box>
    )
  }
  return (
    <Box
      sx={{
        borderRadius: '16px',
        padding: '1rem',
        boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.05), 0px 8px 20px rgba(0, 0, 0, 0.15)',
        height: 'max-content',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        {item.imageURL?.indexOf('ipfs') !== -1 ? (
          <Image src={item.imageURL} sx={{ width: 100, height: 100, boxShadow: '#ccc 0px 3px 3px 2px' }} />
        ) : (
          <Image src="/v2/images/nft.png" sx={{ width: 100, height: 100, boxShadow: '#ccc 0px 3px 3px 2px' }} />
        )}
        <Heart
          style={{
            marginLeft: '5rem',
            color: liked ? '#EFA906' : '#1C1B1F',
            cursor: 'pointer',
          }}
          onClick={() => setLiked(!liked)}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text sx={{ color: '#14114B', fontWeight: '500', fontSize: '16px' }}>{item.name}</Text>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
          <Image src="/v2/images/rocket_launch.svg" sx={{ width: 15 }} />
          <Text sx={{ color: '#4F4F4F', fontWeight: '500', fontSize: '16px' }}>Nov 13</Text>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
          <Image src="/v2/images/group.svg" sx={{ width: 15 }} />
          <Text sx={{ color: '#4F4F4F', fontWeight: '500', fontSize: '14px' }}>{item.totalParticipants}</Text>
        </Box>
      </Box>
      {renderStatistic('Total Staked', item.totalStaked)}
      {renderStatistic('APR', '3.5%')}
      {renderStatistic('Total Yield', item.totalProfit)}
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center', maxWidth: '10rem' }}>
          {['stablecoins', 'low-risk'].map((tag) => renderTag(tag))}
        </Box>
        <Box
          sx={{
            backgroundColor: '#FAE1EB',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0.25rem',
            cursor: 'pointer',
          }}
          onClick={() => {
            router.push(`/v2/strategy?tokenId=${item.tokenId}`)
          }}
        >
          <ArrowRight style={{ color: '#4F4F4F' }} />
        </Box>
      </Box>
    </Box>
  )
}

export default LeaderBoardItem
