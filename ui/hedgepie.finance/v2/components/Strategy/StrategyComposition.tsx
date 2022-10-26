import { useWeb3React } from '@web3-react/core'
import { useAdapterManager } from 'hooks/useAdapterManager'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import { is } from 'immer/dist/internal'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'theme-ui'
import MintWizard from 'views/mint/MintWizard'
import { Modal, useModal } from 'widgets/Modal'
import YieldStakeDoughnut from '../Dashboard/YieldStakeDoughnut'
import chroma from 'chroma-js'

type Strategy = {
  image: string
  name: string
  value: string
  percentage: string
  per: number
  protocol?: string
  pool?: string
}
type Detail = { title: string; value: any }

function StrategyComposition(props: { tokenId: number }) {
  const { tokenId } = props
  const { account } = useWeb3React()
  const { getMaxTokenId, getTokenUri, getAllocations } = useYBNFTMint()
  const { getAdapters } = useAdapterManager()
  const [strategies, setStrategies] = useState<any>([])
  const [metadataURL, setMetadataURL] = useState<string>('')
  const [chartData, setChartData] = useState<any>({})
  const router = useRouter()
  const [onMintModal] = useModal(
    <Modal title="">
      <Box sx={{ width: '1000vw' }}>
        <MintWizard />
      </Box>
    </Modal>,
    false,
  )

  // Get the Metadata, Allocations, etc of the current YBNFT
  useEffect(() => {
    if (!tokenId) return

    const fetchContractData = async () => {
      const maxTokenId = await getMaxTokenId()
      if (Number(tokenId) > maxTokenId) {
        router.push('/')
        return
      }
      const tokenUri = await getTokenUri(tokenId)
      setMetadataURL(tokenUri)
      const allocations = await getAllocations(tokenId)
      console.log(allocations)
      const adapters = await getAdapters()
      console.log(adapters)
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
    fetchContractData()
  }, [tokenId])

  useEffect(() => {
    if (!strategies.length) return
    let tempData: any = {
      label: 'YBNFT',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
      hoverBackgroundColor: '#E98EB3',
      hoverBorderColor: '#E98EB3',
    }
    const f = chroma.scale(['red', 'green', 'yellow', 'blue'])
    const n = strategies.length
    const serial: any[] = []
    for (let i = 0; i < n; i++) {
      serial.push(i / n)
    }
    let colorData = serial.map((s) => f(s))
    tempData.backgroundColor = colorData
    tempData.borderColor = colorData
    setChartData({ ...tempData, data: strategies.map((s) => s.per) })
  }, [strategies])

  useEffect(() => {
    if (!account) return
    const fetchComposition = async () => {}
    fetchComposition()
  }, [tokenId])

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
        <Text sx={{ color: '#14114B', fontSize: '20px', fontWeight: '600', fontFamily: 'Inter' }}>
          Strategy Composition
        </Text>
        <Box
          sx={{
            backgroundColor: '#F3F3F3',
            borderRadius: '4px',
            padding: '0.5rem',
            marginLeft: 'auto',
            cursor: 'pointer',
          }}
          // onClick={() => {
          //   onMintModal()
          // }}
        >
          <Image src="/icons/edit_square.svg" width={20} height={20} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', width: '100%' }}>
        <Box sx={{ border: '1px solid #E3E3E3', borderRadius: '4px', flex: 2 }}>
          <table style={{ width: '100%', borderSpacing: '1rem 2rem' }}>
            <thead>
              <tr style={{ fontFamily: 'Inter', fontWeight: '600', textAlign: 'center' }}>
                <td></td>
                <td>Protocol</td>
                <td>Type</td>
                <td>Pool</td>
                <td>Percentage</td>
              </tr>
            </thead>
            <tbody>
              {strategies.map((s) => (
                <tr style={{ textAlign: 'center' }}>
                  <td>
                    <Image src={'/v2/' + s.image} width={30} height={30} />
                  </td>
                  <td>{s.protocol}</td>
                  <td>{s.type}</td>
                  <td>{s.pool}</td>
                  <td>{s.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        <Box
          sx={{
            border: '1px solid #E3E3E3',
            borderRadius: '4px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
          }}
        >
          <Text sx={{ color: '#14114B', fontSize: '16px', fontWeight: '600', fontFamily: 'Inter' }}>Weight</Text>
          <Box
            sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}
          >
            <YieldStakeDoughnut data={chartData} labels={strategies.map((s) => `${s.protocol} (${s.pool})`)} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default StrategyComposition
