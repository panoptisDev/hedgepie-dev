import Image from 'next/image'
import React from 'react'
import { Box, Text } from 'theme-ui'
import { SidebarItemType } from './Sidebar'

interface SidebarItemProps {
  type?: SidebarItemType
  active?: SidebarItemType
}

function SidebarItem(props: SidebarItemProps) {
  const { type, active } = props
  const isActive = active === type

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
      default:
        return type
    }
  }

  const getIcon = (type: SidebarItemType | undefined) => {
    switch (type) {
      case 'home':
        return '/icons/home.svg'
      case 'stats':
        return '/icons/credit-card.svg'
      case 'history':
        return '/icons/list.svg'
      case 'help':
        return '/icons/help.svg'
      default:
        return '/icons/home.svg'
    }
  }
  return (
    <Box
      sx={{
        backgroundColor: isActive ? '#FFFFFF' : '#14114B',
        borderRadius: '14px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        margin: '5px 2px',
        gap: ['10px', '10px', '10px', '30px'],
        cursor: 'pointer',
      }}
    >
      <img src={getIcon(type)} />
      <Text sx={{ color: '#667080', marginTop: '-3px' }}>{getTitle(type)}</Text>
    </Box>
  )
}

export default SidebarItem
