import React, { useContext, useEffect, useState } from 'react'
import { Box, Button } from 'theme-ui'
import DashboardContext from 'v2/contexts/DashboardContext'
import SidebarItem from './SidebarItem'
import { useRouter } from 'next/router'

interface SidebarProps {
  active: string
}

export type SidebarItemType = 'home' | 'stats' | 'history' | 'help'

function Sidebar(props: SidebarProps) {
  // const sidebarItems: SidebarItemType[] = ['home', 'stats', 'history']

  const sidebarItems: SidebarItemType[] = ['home', 'stats']
  const dashboardValue = useContext(DashboardContext)
  const router = useRouter()

  const getPageName = (s: SidebarItemType) => {
    switch (s) {
      case 'home':
        return 'v2/dashboard'
      case 'stats':
        return 'v2/strategy'
      default:
        return 'v2/dashboard'
    }
  }
  return (
    <Box
      sx={{
        minWidth: ['0rem', '0rem', '0rem', '18rem'],
        backgroundColor: '#14114B',
        borderTopLeftRadius: '14px',
        borderBottomLeftRadius: '14px',
        padding: ['0rem', '0rem', '2rem 2rem', '2rem 2rem'],
        display: ['none', 'none', 'flex', 'flex'],
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {sidebarItems.map((s) => (
          <Box
            onClick={() => {
              dashboardValue.setActiveTab(s)
              router.push(`/${getPageName(s)}`)
            }}
          >
            <SidebarItem type={s} active={dashboardValue.activeTab} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: 'auto' }}>
        <Box sx={{ border: '1px solid #667080', width: '100%' }}></Box>
        <Box onClick={() => dashboardValue.setActiveTab('help')}>
          <SidebarItem type="help" active={dashboardValue.activeTab} />
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar
