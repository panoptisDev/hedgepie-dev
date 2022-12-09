import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'

interface PillTabsProps {
  contents: { head: React.ReactNode; content: React.ReactNode }[]
}

function PillTabs(props: PillTabsProps) {
  const { contents } = props
  const [activeTab, setActiveTab] = useState<number>(0)

  const activeTabStyles = {
    background: '#FFFFFF',
    boxShadow: '0px 2px 10px rgba(204, 204, 204, 0.65)',
    borderRadius: '40px',
    width: '100%',
    cursor: 'pointer',
  }
  const inactiveTabStyles = {
    border: '1px solid #BAB9C5',
    filter: 'drop-shadow(0px 2px 4px rgba(204, 204, 204, 0.3))',
    borderRadius: '40px',
    width: '100%',
    cursor: 'pointer',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Box
        sx={{
          backgroundColor: '#F3F3F3',
          borderRadius: '50px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {contents.map((c, i) => (
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
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>{contents[activeTab].content}</Box>
    </Box>
  )
}

export default PillTabs
