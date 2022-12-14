import Image from 'next/image'
import React, { useContext } from 'react'
import { Box, Text } from 'theme-ui'
import DashboardContext from 'v2/contexts/DashboardContext'
import { SidebarItemType } from './Sidebar'

interface SidebarItemProps {
  type?: SidebarItemType
  active?: SidebarItemType
}

function SidebarItem(props: SidebarItemProps) {
  const { type, active } = props
  const isActive = active === type
  const { sidebarExpanded } = useContext(DashboardContext)

  const getTitle = (type: SidebarItemType | undefined) => {
    switch (type) {
      case 'home':
        return 'Home'
      case 'stats':
        return 'My Stats'
      case 'history':
        return 'History'
      case 'help':
        return 'Help'
      case 'leaderboard':
        return 'Leaderboard'
      case 'mint':
        return 'Create'
      case 'dashboard':
        return 'Dashboard'
      default:
        return type
    }
  }

  const getIcon = (type: SidebarItemType | undefined, active: boolean) => {
    const folder = active ? 'pink' : 'grey'
    switch (type) {
      case 'home':
        return `/icons/${folder}/home.svg`
      case 'stats':
        return `/icons/${folder}/stats.svg`
      case 'history':
        return `/icons/${folder}/history.svg`
      case 'help':
        return '/icons/help.svg'
      case 'leaderboard':
        return `/icons/${folder}/leaderboard.svg`
      case 'mint':
        return `/icons/${folder}/create.svg`
      case 'dashboard':
        return `/icons/${folder}/dashboard.svg`
      default:
        return '/icons/home.svg'
    }
  }
  return (
    <Box
      sx={{
        backgroundColor: '#14114B',
        // borderRadius: '14px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        margin: '5px 2px',
        gap: ['10px', '10px', '10px', '20px'],
        cursor: 'pointer',
        width: 'max-content',
      }}
    >
      <img src={getIcon(type, isActive)} style={{ fill: '#FFFFFF' }} />
      {sidebarExpanded ? (
        <Text sx={{ color: isActive ? '#FFFFFF' : '#667080', marginTop: '-3px' }}>{getTitle(type)}</Text>
      ) : null}
    </Box>
  )
}

export default SidebarItem
