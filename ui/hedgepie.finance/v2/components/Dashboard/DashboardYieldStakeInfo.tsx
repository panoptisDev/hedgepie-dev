import { useInvestor } from 'hooks/useInvestor'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import React, { useState, useEffect } from 'react'
import { Box, Spinner, Text } from 'theme-ui'
import { getBalanceInEther } from 'utils/formatBalance'
import { getPrice } from 'utils/getTokenPrice'
import YieldStakeDoughnut from './YieldStakeDoughnut'
import chroma from 'chroma-js'

type Tab = 'yield' | 'stake'
function DashboardYieldStakeInfo() {
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<Tab>('yield')
  const [instruments, setInstruments] = useState<any>([])
  const [yields, setYields] = useState<{ title: string; value: number; color: string }[]>([])
  const [stakes, setStakes] = useState<{ title: string; value: number; color: string }[]>([])
  const [totalYield, setTotalYield] = useState<number>()
  const [totalStake, setTotalStake] = useState<number>()
  const [invested, setInvested] = useState<number[]>([])
  const { getYield, getBalance } = useInvestor()
  const { getMaxTokenId, getTokenUri } = useYBNFTMint()
  const [stakeChartData, setStakeChartData] = useState<any>({})
  const [yieldChartData, setYieldChartData] = useState<any>({})
  const [bnbPrice, setBNBPrice] = useState<number>(0)
  const [nftNames, setNFTNames] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])

  useEffect(() => {
    const fetchAndSetBNBPrice = async () => {
      const price = await getPrice('BNB')
      price && setBNBPrice(price)
    }
    fetchAndSetBNBPrice()
  }, [])

  // START - Fetch and Store Yields

  // START - Get indices of invested tokens
  useEffect(() => {
    const getInvestedFunds = async () => {
      setLoading(true)
      let investedData: number[] = []
      const maxTokenId = await getMaxTokenId()
      for (let i = 1; i <= maxTokenId; i++) {
        if (process.env.DUMMY_TOKENS && Array.from(JSON.parse(process.env.DUMMY_TOKENS))?.indexOf(i) !== -1) continue
        const investedInToken = await getBalance(i)
        if (getBalanceInEther(investedInToken) !== getBalanceInEther(0)) {
          investedData.push(i)
        }
      }
      setInvested(investedData)
    }
    getInvestedFunds()
  }, [])
  // END - Get indices of invested tokens

  // START - Get Data for the Total Yield and Total Stake tabs/chart
  useEffect(() => {
    if (!invested.length) return
    const fetchAndStoreYields = async () => {
      let stakesArr: any[] = []
      let yieldsArr: any[] = []
      let stakeValueArr: any[] = []
      let yieldValueArr: any[] = []
      let rewardTot = Number(0)
      let stakeTot = Number(0)
      let nftNamesArr: string[] = []
      let tempData: any = {
        label: 'YBNFT',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        hoverBackgroundColor: '#E98EB3',
        hoverBorderColor: '#E98EB3',
      }
      const f = chroma.scale(['green', 'blue'])
      const n = invested.length
      const serial: any[] = []
      for (let i = 0; i < n; i++) {
        serial.push(i)
      }
      let colorData = serial.map((s) => f(s))
      tempData.backgroundColor = colorData
      tempData.borderColor = colorData
      setColors(colorData)
      for (let index = 0; index < invested.length; index++) {
        const i = invested[index]
        const bnbPrice = await getPrice('BNB')
        const stake = await getBalance(i)
        const reward = await getYield(i)
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
        nftNamesArr.push(metadata.name)
        let stakeObj = {
          color: colorData[index].toString(),
          title: metadata.name,
          value: `$${bnbPrice ? getBalanceInEther(bnbPrice * stake).toFixed(5) : 0.0} USD`,
        }
        stakeTot = stakeTot + Number(stake)
        stakeValueArr.push(getBalanceInEther(stake))
        stakesArr.push(stakeObj)
        let yieldObj = {
          color: colorData[index].toString(),
          title: metadata.name,
          value: `$${bnbPrice ? getBalanceInEther(bnbPrice * reward).toFixed(5) : 0.0} USD`,
        }
        rewardTot = rewardTot + Number(reward)
        yieldValueArr.push(getBalanceInEther(reward))
        console.log('reward ' + reward)
        console.log('rewardTot ' + rewardTot)

        yieldsArr.push(yieldObj)
      }
      setStakes(stakesArr)
      setYields(yieldsArr)
      setTotalStake(getBalanceInEther(stakeTot))
      setTotalYield(getBalanceInEther(rewardTot))
      setStakeChartData({ ...tempData, data: stakeValueArr })
      setYieldChartData({ ...tempData, data: yieldValueArr })
      setNFTNames(nftNamesArr)
      setLoading(false)
    }
    fetchAndStoreYields()
  }, [invested])
  // END - Fetch and Store Yields

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
        width: '100%',
        minHeight: '20rem',
        padding: '1.5rem 1.5rem 1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}
    >
      {invested.length ? (
        <>
          {loading ? (
            <Box
              sx={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Spinner />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: ['column', 'row', 'row', 'row'],
                alignItems: 'center',
                width: '100%',
                gap: '20px',
                height: '20rem',
              }}
            >
              {/* Tabs View */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0px', alignItems: 'center' }}>
                  <Box
                    sx={{
                      color: activeTab === 'yield' ? '#1799DE' : '#000000',
                      borderBottom: activeTab === 'yield' ? '2px solid #1799DE' : '2px solid #D9D9D9',
                      cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans',
                      padding: '1rem',
                    }}
                    onClick={() => {
                      setActiveTab('yield')
                    }}
                  >
                    <Text sx={{ fontSize: '16px', fontFamily: 'Plus Jakarta Sans', fontWeight: '600' }}>
                      Total Yield
                    </Text>
                  </Box>
                  <Box
                    sx={{
                      color: activeTab === 'stake' ? '#1799DE' : '#000000',
                      borderBottom: activeTab === 'stake' ? '2px solid #1799DE' : '2px solid #D9D9D9',
                      cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans',
                      padding: '1rem',
                    }}
                    onClick={() => {
                      setActiveTab('stake')
                    }}
                  >
                    <Text sx={{ fontSize: '16px', fontFamily: 'Plus Jakarta Sans', fontWeight: '600' }}>
                      Total Staked
                    </Text>
                  </Box>
                </Box>
                <Box sx={{ width: '100%', height: '100%', padding: '0.5rem' }}>
                  {activeTab === 'yield' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <Text
                          sx={{
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#000000',
                          }}
                        >
                          {`$${bnbPrice && totalYield ? (bnbPrice * totalYield).toFixed(4) : '0.0'} USD`}
                        </Text>
                        {/* <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '10px', fontWeight: '700', color: '#4F4F4F' }}>
                    10th Aug - 19th Sept, 2022
                  </Text> */}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {yields.map((i) => (
                          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                            <Box
                              sx={{ width: '10px', height: '10px', backgroundColor: i.color, borderRadius: '60px' }}
                            ></Box>
                            <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '16px', fontWeight: '600' }}>
                              {i.title}
                            </Text>
                            <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '14px', fontWeight: '400' }}>
                              {i.value}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {activeTab === 'stake' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <Text
                          sx={{
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#000000',
                          }}
                        >
                          {`$${bnbPrice && totalStake ? (bnbPrice * totalStake).toFixed(4) : '0.0'} USD`}
                        </Text>
                        {/* <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '10px', fontWeight: '700', color: '#4F4F4F' }}>
                    10th Aug - 19th Sept, 2022
                  </Text> */}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stakes.map((i) => (
                          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                            <Box
                              sx={{ width: '10px', height: '10px', backgroundColor: i.color, borderRadius: '60px' }}
                            ></Box>
                            <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '16px', fontWeight: '600' }}>
                              {i.title}
                            </Text>
                            <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '14px', fontWeight: '400' }}>
                              {i.value}
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  backgroundColor: '#FEF6F9',
                  border: '1px solid #BAB9C5',
                  padding: '1rem',
                  borderRadius: '16px',
                }}
              >
                <YieldStakeDoughnut data={activeTab === 'yield' ? yieldChartData : stakeChartData} labels={nftNames} />
              </Box>
            </Box>
          )}
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '25px',
            margin: '1rem 1rem',
            height: '18rem',
            padding: '0rem 0.75rem',
          }}
        >
          <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px', color: '#14114B', fontWeight: '600' }}>
            Please Stake into some Strategies to view its data here 🎉
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default DashboardYieldStakeInfo
