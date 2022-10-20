import React, { useContext, useEffect, useState } from 'react'
import { Box, Button } from 'theme-ui'
import DashboardContext from 'v2/contexts/DashboardContext'
import SidebarItem from './SidebarItem'

interface SidebarProps {
  active: string
}

export type SidebarItemType = 'home' | 'stats' | 'history' | 'help'

function Sidebar(props: SidebarProps) {
  const sidebarItems: SidebarItemType[] = ['home', 'stats', 'history']
  const dashboardValue = useContext(DashboardContext)

  return (
    <Box
      sx={{
        minWidth: '18rem',
        backgroundColor: '#14114B',
        borderTopLeftRadius: '14px',
        borderBottomLeftRadius: '14px',
        padding: '2rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {sidebarItems.map((s) => (
          <Box onClick={() => dashboardValue.setActiveTab(s)}>
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
