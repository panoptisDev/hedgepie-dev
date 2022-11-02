import React, { useContext, useEffect, useState } from 'react'
import { Box, Button } from 'theme-ui'
import DashboardContext from 'v2/contexts/DashboardContext'
import SidebarItem from './SidebarItem'
import { useRouter } from 'next/router'

interface SidebarProps {
  active: string
}

export type SidebarItemType = 'home' | 'stats' | 'history' | 'help'

function SidebarMobile(props: SidebarProps) {
  const sidebarItems: SidebarItemType[] = ['home', 'stats', 'history']
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
        minWidth: ['0rem', '0rem', '0rem', '100%'],
        backgroundColor: '#14114B',
        borderRadius: '14px',
        margin: '10px 0px',
        display: ['flex', 'flex', 'none', 'none'],
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: ['row', 'row', 'row', 'column'],
          justifyContent: 'space-between',
          gap: '5px',
        }}
      >
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
    </Box>
  )
}

export default SidebarMobile
