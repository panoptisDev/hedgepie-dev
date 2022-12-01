import React from 'react'
import { Box, Image, Text } from 'theme-ui'

export type LeaderboardFilterType =
  | 'new'
  | 'featured'
  | 'stablecoins'
  | 'bitcoin'
  | 'low-risk'
  | 'high-risk'
  | 'low-imp-loss'
  | 'saved'

const filterNames: { [key in LeaderboardFilterType]?: string } = {
  new: 'New',
  featured: 'Featured',
  stablecoins: 'Stablecoins',
  bitcoin: 'Bitcoin',
  'low-risk': 'Low-risk',
  'high-risk': 'High-risk',
  'low-imp-loss': 'Low impermanence loss',
  saved: 'Saved',
}

const filterIcon = (filterType: LeaderboardFilterType) => `/lb_filters/${filterType}.svg`

function LeaderboardFilter() {
  const leaderboardFilters: LeaderboardFilterType[] = [
    'new',
    'featured',
    'stablecoins',
    'bitcoin',
    'low-risk',
    'high-risk',
    'low-imp-loss',
    'saved',
  ]
  const renderFilterItem = (filterType: LeaderboardFilterType) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '8px 10px',
        backgroundColor: '#F3F3F3',
        borderRadius: '16px',
        gap: '10px',
        cursor: 'pointer',
      }}
    >
      <Text sx={{ color: '#1A1A1A', fontSize: '12px' }}>{filterNames[filterType]}</Text>
      <Image src={filterIcon(filterType)} />
    </Box>
  )
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#FFFFFF',
          borderRadius: '50px',
          gap: '20px',
          flex: 6,
          width: 'max-content',
        }}
      >
        {leaderboardFilters.map((l, i) => (
          <div key={i}>{renderFilterItem(l)}</div>
        ))}
      </Box>
      {/* <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '0.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          flex: 1,
        }}
      ></Box> */}
    </Box>
  )
}

export default LeaderboardFilter
