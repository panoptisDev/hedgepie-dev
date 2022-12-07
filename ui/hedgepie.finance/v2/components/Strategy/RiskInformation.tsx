import { useWeb3React } from '@web3-react/core'
import { useAdapterManager } from 'hooks/useAdapterManager'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Box, Image, Spinner, Text } from 'theme-ui'
import PillTabs from 'widgets/PillTabs'
import { Strategy } from './StrategyComposition'

interface RiskInformationProps {
  tokenId: number
}

function RiskInformation(props: RiskInformationProps) {
  const { tokenId } = props
  const { account } = useWeb3React()
  const [loading, setLoading] = useState(false)
  const { getMaxTokenId, getTokenUri, getAllocations } = useYBNFTMint()
  const { getAdapters } = useAdapterManager()
  const [strategies, setStrategies] = useState<any>([])
  const router = useRouter()

  const [pillTabsContents, setPillTabsContents] = useState<any>([])

  useEffect(() => {
    if (!tokenId) return

    const fetchContractData = async () => {
      const maxTokenId = await getMaxTokenId()
      if (Number(tokenId) > maxTokenId) {
        router.push('/')
        return
      }
      if (process.env.DUMMY_TOKENS && Array.from(JSON.parse(process.env.DUMMY_TOKENS))?.indexOf(tokenId) !== -1) {
        router.push('/')
        return
      }
      const allocations = await getAllocations(tokenId)
      const adapters = await getAdapters()
      let mappings = [] as Strategy[]
      for (let allocation of allocations) {
        let obj = { name: '', percentage: '', image: '', value: '', per: 0, protocol: '', pool: '', type: '' }
        adapters.map((adapter) => {
          adapter.addr == allocation.addr ? (obj.name = adapter.name) : ''
        })
        obj.per = allocation.allocation / 100
        obj.percentage = (allocation.allocation / 100).toString() + '%'
        if (obj.name.toLowerCase().includes('apeswap')) {
          obj.image = 'images/apeswap.png'
        }
        if (obj.name.toLowerCase().includes('autofarm')) {
          obj.image = 'images/autofarm.png'
        }
        if (obj.name.toLowerCase().includes('biswap')) {
          obj.image = 'images/biswap.png'
        }
        if (obj.name.toLowerCase().includes('beefy')) {
          obj.image = 'images/beefy.png'
        }
        if (obj.name.toLowerCase().includes('belt')) {
          obj.image = 'images/belt.png'
        }
        if (obj.name.toLowerCase().includes('venus')) {
          obj.image = 'images/venus.png'
        }
        if (obj.name.toLowerCase().includes('alpaca')) {
          obj.image = 'images/alpaca.png'
        }
        if (obj.name.toLowerCase().includes('pks')) {
          obj.image = 'images/cake.png'
        }
        let split = obj?.name?.split('::')
        obj.protocol = split?.[0]
        obj.pool = split?.[split?.length - 1]
        obj.type = split?.[1]
        mappings.push(obj)
      }
      setStrategies(mappings)
    }
    setLoading(true)
    fetchContractData()
    setLoading(false)
  }, [tokenId])

  useEffect(() => {
    if (!strategies.length) return
    let tabsContent: any[] = []
    for (var i = 0; i < strategies.length; i++) {
      let obj: any = {}
      obj.head = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Box>
            <Image src={strategies[i].image} />
            <Text>{strategies[i].pool}</Text>
          </Box>
          <Box>
            <Text>{strategies[i].protocol}</Text>
          </Box>
        </Box>
      )

      obj.content = <></>
      tabsContent.push(obj)
    }
    setPillTabsContents(tabsContent)
  }, [strategies])

  return (
    <Box
      sx={{
        borderRadius: '16px',
        boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
        border: '1px solid #D9D9D9',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        background: '#FFFFFF',
        padding: '1rem 2rem',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text sx={{ color: '#14114B', fontSize: '20px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans' }}>
          Risk Information
        </Text>
        {loading ? <Spinner /> : null}
        {!loading ? <PillTabs contents={pillTabsContents} /> : null}
      </Box>
    </Box>
  )
}

export default RiskInformation
