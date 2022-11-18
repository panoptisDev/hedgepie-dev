import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'
import DashboardContext from 'v2/contexts/DashboardContext'
import Sidebar, { SidebarItemType } from 'v2/components/Sidebar'
import SidebarMobile from 'v2/components/SidebarMobile'
import { useYBNFTMint } from 'hooks/useYBNFTMint'

interface DashboardPageProps {
  children: React.ReactNode
  tab?: SidebarItemType
}

function DashboardPage(props: DashboardPageProps) {
  const { children, tab } = props
  const [activeTab, setActiveTab] = useState<SidebarItemType>('home')
  const [tokens, setTokens] = useState<{ id: number; name: string }[]>([])
  const { getMaxTokenId, getTokenUri } = useYBNFTMint()
  const value = React.useMemo(
    () => ({
      activeTab,
      setActiveTab,
      tokens,
    }),
    [activeTab, setActiveTab, tokens],
  )

  useEffect(() => {
    tab && setActiveTab(tab)
  }, [tab])

  const getSideBarItems = async () => {
    const maxTokenId = await getMaxTokenId()
    let tokenArr: any[] = []
    for (let i = 1; i <= maxTokenId; i++) {
      if (process.env.DUMMY_TOKENS && Array.from(JSON.parse(process.env.DUMMY_TOKENS))?.indexOf(i) !== -1) continue
      const tokenUri = await getTokenUri(i)
      if (!tokenUri.includes('.ipfs.')) {
        return
      }
      let metadataFile: any = undefined
      try {
        metadataFile = await fetch(tokenUri)
      } catch (err) {
        return
      }
      const metadata = await metadataFile.json()
      tokenArr.push({ id: i, name: metadata.name })
    }
    setTokens(tokenArr)
  }

  // useEffect(() => {
  //   getSideBarItems()
  // }, [])

  return (
    <DashboardContext.Provider value={value}>
      <>
        {/* TODO : Decide the Mobile view of a sidebar */}
        {/* <SidebarMobile active={activeTab} /> */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            margin: ['0.5rem', '0.5rem', '0.5rem', '2rem 4rem 8rem 4rem'],
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
