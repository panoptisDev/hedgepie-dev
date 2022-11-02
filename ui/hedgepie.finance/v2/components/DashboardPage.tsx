import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'
import DashboardContext from 'v2/contexts/DashboardContext'
import Sidebar, { SidebarItemType } from 'v2/components/Sidebar'
import SidebarMobile from 'v2/components/SidebarMobile'

interface DashboardPageProps {
  children: React.ReactNode
  tab?: SidebarItemType
}

function DashboardPage(props: DashboardPageProps) {
  const { children, tab } = props
  const [activeTab, setActiveTab] = useState<SidebarItemType>('home')
  const value = React.useMemo(
    () => ({
      activeTab,
      setActiveTab,
    }),
    [activeTab, setActiveTab],
  )

  useEffect(() => {
    tab && setActiveTab(tab)
  }, [tab])

  return (
    <DashboardContext.Provider value={value}>
      <>
        <SidebarMobile active={activeTab} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            margin: ['0.5rem', '2rem 4rem 8rem 4rem', '2rem 4rem 8rem 4rem', '2rem 4rem 8rem 4rem'],
            borderRadius: '16px',
            background: 'linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
          }}
        >
          <Sidebar active={activeTab} />
          {children}
        </Box>
      </>
    </DashboardContext.Provider>
  )
}

export default DashboardPage
