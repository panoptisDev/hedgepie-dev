import React from 'react'
import { Box } from 'theme-ui'

interface PillTabsProps {
  contents: { head?: React.ReactNode; content?: React.ReactNode }[]
}

function PillTabs(props: PillTabsProps) {
  const { contents } = props
  return (
    <Box>
      {contents.map((c) => (
        <>
          {c.head}
          {c.content}
        </>
      ))}
    </Box>
  )
}

export default PillTabs
