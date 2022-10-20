import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'
import DashboardContext from 'v2/contexts/DashboardContext'
import Sidebar, { SidebarItemType } from './Sidebar'

interface DashboardPageProps {
  children: React.ReactNode
}

function DashboardPage(props: DashboardPageProps) {
  const { children } = props
  const [activeTab, setActiveTab] = useState<SidebarItemType>('home')
  const value = React.useMemo(
    () => ({
      activeTab,
      setActiveTab,
    }),
    [activeTab, setActiveTab],
  )

  return (
    <DashboardContext.Provider value={value}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          margin: '2rem 4rem 8rem 4rem',
          borderRadius: '16px',
          background: 'linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
        }}
      >
        <Sidebar active={activeTab} />
        {children}
      </Box>
    </DashboardContext.Provider>
  )
}

export default DashboardPage
