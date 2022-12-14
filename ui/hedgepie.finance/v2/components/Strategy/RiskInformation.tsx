import { useWeb3React } from '@web3-react/core'
import { useAdapterManager } from 'hooks/useAdapterManager'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Box, Image, Spinner, Text } from 'theme-ui'
import ContentTabs from 'widgets/ContentTabs'
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
        let obj = {
          name: '',
          percentage: '',
          image: '',
          value: '',
          per: 0,
          protocol: '',
          pool: '',
          type: '',
          score: '',
        }
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
        obj.score = '8.0'
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
    let textContentTabs: any[] = [] // i :index,head:string,content:string

    for (var i = 0; i < strategies.length; i++) {
      const textTabs: { title: string; text: string }[] = [
        {
          title: 'Token Value',
          text: 'The BNB token is.... and since this liquidity pool contains a 50% weighting of BNB tokens, that means that x% of your deposit will be exposed to price fluctuations in BNB between the time that you deposit and the time that you withdraw.',
        },
        {
          title: 'Impermanence Loss',
          text: 'The BNB token is.... and since this liquidity pool contains a 50% weighting of BNB tokens, that means that x% of your deposit will be exposed to price fluctuations in BNB between the time that you deposit and the time that you withdraw.',
        },
        {
          title: 'Smart Contract',
          text: 'The BNB token is.... and since this liquidity pool contains a 50% weighting of BNB tokens, that means that x% of your deposit will be exposed to price fluctuations in BNB between the time that you deposit and the time that you withdraw.',
        },
        {
          title: 'Counter party',
          text: 'The BNB token is.... and since this liquidity pool contains a 50% weighting of BNB tokens, that means that x% of your deposit will be exposed to price fluctuations in BNB between the time that you deposit and the time that you withdraw.',
        },
        {
          title: 'Liquidation Risk',
          text: 'The BNB token is.... and since this liquidity pool contains a 50% weighting of BNB tokens, that means that x% of your deposit will be exposed to price fluctuations in BNB between the time that you deposit and the time that you withdraw.',
        },
      ]
      let contentTabsObjs: any[] = []
      for (var j = 0; j < textTabs.length; j++) {
        let obj: any = {}
        obj.head = textTabs[j].title
        obj.content = textTabs[j].text
        contentTabsObjs.push(obj)
      }
      textContentTabs.push(contentTabsObjs)
    }
    let tabsContent: any[] = []
    for (var i = 0; i < strategies.length; i++) {
      let obj: any = {}
      obj.head = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '20px 20px 16px 30px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
            <Image src={strategies[i].image} sx={{ width: '25px', height: '25px' }} />
            <Text sx={{ color: '#1A1A1A', fontWeight: '500', fontSize: '16px' }}>{strategies[i].pool}</Text>
          </Box>
          <Box>
            <Text sx={{ color: '#1A1A1A', fontWeight: '500', fontSize: '14px' }}>{strategies[i].protocol}</Text>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
            <Text sx={{ color: '#08CE04', fontWeight: '700', fontSize: '14px' }}>{strategies[i].score}</Text>
            <Image src="/images/help-tooltip.svg" sx={{ width: '12px', height: '12px' }} />
          </Box>
        </Box>
      )

      obj.content = (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              color: '#1A1A1A',
              fontWeight: '400',
              fontSize: '16px',
            }}
          >
            <Text>
              {`This fund has (x%) exposure to the ${strategies[i].protocol} ${strategies[i].pool} liquidity pool`}
            </Text>
            <Text>The risks of this Pool are:</Text>
          </Box>
          <ContentTabs tabs={textContentTabs[i]} />
        </Box>
      )
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Text sx={{ color: '#14114B', fontSize: '20px', fontWeight: '600', fontFamily: 'Plus Jakarta Sans' }}>
          Risk Information
        </Text>
        {loading ? <Spinner /> : null}
        {!loading && pillTabsContents && pillTabsContents.length ? <PillTabs contents={pillTabsContents} /> : null}
      </Box>
    </Box>
  )
}

export default RiskInformation
