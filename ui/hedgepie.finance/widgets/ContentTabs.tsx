import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'

interface ContentTabsProps {
  tabs: { head: React.ReactNode; content: React.ReactNode }[]
}

function ContentTabs(props: ContentTabsProps) {
  const { tabs } = props
  const [activeTab, setActiveTab] = useState<number>(0)

  const activeTabStyles = {
    background: '#F3F3F3',
    boxShadow: 'inset 0px -6px 6px rgba(0, 0, 0, 0.1)',
    color: '#14114B',
    fontWeight: '600',
    fontSize: '14px',
    width: '100%',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '3px solid #8BCCEE',
    cursor: 'pointer',
  }
  const inactiveTabStyles = {
    color: '#4F4F4F',
    fontWeight: '400',
    fontSize: '14px',
    width: '100%',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          padding: '12px 0px 0px 0px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: '8px',
          borderBottom: '1px solid #BAB9C5',
        }}
      >
        {tabs.map((c, i) => (
          <Box
            sx={activeTab === i ? activeTabStyles : inactiveTabStyles}
            onClick={() => {
              setActiveTab(i)
            }}
          >
            {c.head}
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #4F4F4F',
          borderRadius: '16px',
          padding: '18px 16px',
        }}
      >
        {`${tabs[activeTab].head} - ${tabs[activeTab].content}`}
      </Box>
    </Box>
  )
}

export default ContentTabs
