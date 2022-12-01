import React, { useContext, useEffect, useState } from 'react'
import { Box, Button } from 'theme-ui'
import DashboardContext from 'v2/contexts/DashboardContext'
import SidebarItem from './SidebarItem'
import { useRouter } from 'next/router'
import { ChevronLeft, ChevronRight } from 'react-feather'

interface SidebarProps {
  active: string
}

export type SidebarItemType = 'home' | 'stats' | 'history' | 'help' | 'leaderboard' | 'mint' | 'dashboard'

function Sidebar(props: SidebarProps) {
  // const sidebarItems: SidebarItemType[] = ['home', 'stats', 'history']

  const sidebarItems: SidebarItemType[] = ['home', 'dashboard', 'leaderboard', 'stats', 'history', 'mint']
  const { activeTab, setActiveTab, sidebarExpanded, setSidebarExpanded } = useContext(DashboardContext)
  const router = useRouter()

  const getPageName = (s: SidebarItemType) => {
    switch (s) {
      case 'home':
        return 'v2/dashboard'
      case 'stats':
        return 'v2/strategy?tokenId=1'
      case 'leaderboard':
        return 'v2/leaderboard'
      case 'mint':
        return 'v2/mint'
      default:
        return 'v2/dashboard'
    }
  }
  return (
    <Box
      sx={{
        minWidth: sidebarExpanded ? ['0rem', '0rem', '0rem', '14rem'] : '0rem',
        backgroundColor: '#14114B',
        // borderTopLeftRadius: '14px',
        borderBottomLeftRadius: '14px',
        padding: ['0rem', '0rem', '1rem 1rem', '1rem 1rem'],
        display: ['none', 'none', 'none', 'flex'],
        flexDirection: 'column',
        minHeight: '100vh',
        boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.25)',
        borderTop: '1px solid #475569',
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            cursor: 'pointer',
            justifyContent: !sidebarExpanded ? 'center' : 'flex-end',
          }}
          onClick={() => {
            setSidebarExpanded(!sidebarExpanded)
          }}
        >
          <Box
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              setSidebarExpanded(!sidebarExpanded)
            }}
          >
            {sidebarExpanded ? (
              <ChevronLeft style={{ color: '#667080' }} />
            ) : (
              <ChevronRight style={{ color: '#667080' }} />
            )}
          </Box>
        </Box>
        {sidebarItems.map((s) => (
          <Box
            onClick={() => {
              setActiveTab(s)
              router.push(`/${getPageName(s)}`)
            }}
          >
            <SidebarItem type={s} active={activeTab} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: 'auto' }}>
        <Box sx={{ border: '1px solid #667080', width: '100%' }}></Box>
        <Box onClick={() => setActiveTab('help')}>
          <SidebarItem type="help" active={activeTab} />
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar
