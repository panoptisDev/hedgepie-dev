/** @jsx jsx */
/** @jsxRuntime classic */

import { useState, useEffect } from 'react'
import { ThemeProvider, jsx, Box, Flex, Button, Text, Image, Input, ThemeUICSSObject, Badge, Spinner } from 'theme-ui'
import { theme } from 'themes/theme'
import { styles } from './styles'
import { useRouter } from 'next/router'
import ActionStake from './ActionStake'
import queryString from 'query-string'

import { useYBNFTMint } from 'hooks/useYBNFTMint'
import { useAdapterManager } from 'hooks/useAdapterManager'
import Link from 'next/link'
import { getPrice } from 'utils/getTokenPrice'
import Yield from './Yield'

import { useInvestor } from 'hooks/useInvestor'
import { getBalanceInEther } from 'utils/formatBalance'
import { useWeb3React } from '@web3-react/core'

// TODO : Define the props type to get the NFT details in setState and useEffect and display in the UI
type Props = {}

type Badge = { title: string; value: string }
type Strategy = { image: string; name: string; value: string; percentage: string; per: number }
type Detail = { title: string; value: any }

const ViewContents = (props: Props) => {
  const [ybnftName, setYbnftName] = useState('')
  const [badges, setBadges] = useState([] as Badge[])
  const [strategies, setStrategies] = useState([] as Strategy[])
  const [details, setDetails] = useState([] as Detail[])
  const [staked, setStaked] = useState<number>()
  const [owner, setOwner] = useState({ name: 'OWNER', image: 'images/owner.png' })
  const router = useRouter()
  const [tokenId, setTokenId] = useState<string>()
  const [metadataURL, setMetadataURL] = useState<string>()
  const [imageURL, setImageURL] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [bnbPrice, setBNBPrice] = useState<any>()

  const { getTokenUri, getAllocations, getMaxTokenId } = useYBNFTMint()
  const { getAdapters } = useAdapterManager()

  // Get the Token ID of the current YBNFT
  useEffect(() => {
    if (router && router.query && router.query.tokenId) {
      setTokenId(router.query.tokenId as string)
    } else {
      const res = queryString.parse(router.asPath.split(/\?/)[1])
      setTokenId(res.tokenId as string)
    }
  }, [])

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
        let obj = { name: '', percentage: '', image: '', value: '', per: 0 }
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
        mappings.push(obj)
      }
      setStrategies(mappings)
    }
    fetchContractData()
  }, [tokenId])

  // Set the Metadata JSON URL, Image and NFT Name/Description from the metadata
  useEffect(() => {
    if (!metadataURL) return
    const fetchAndPopulateMetadataItems = async () => {
      const metadataFile = await fetch(metadataURL)
      const metadata = await metadataFile.json()
      setImageURL(metadata.imageURL)
      setYbnftName(metadata.name)
      setDescription(metadata.description)
    }
    fetchAndPopulateMetadataItems()
  }, [metadataURL])

  // Setting badges,strategies with the default values, which should later be taken from the props
  useEffect(() => {
    setBadges([
      { title: 'COLLECTIVE APY:', value: '500%' },
      { title: 'TLV:', value: '$5000' },
      { title: 'Participants:', value: '487' },
    ])
  }, [])

  useEffect(() => {
    if (staked && staked > 0) {
      var obj = {} as any
      var newArr = [] as any[]
      strategies.forEach((s) => {
        obj = { ...s }
        obj.value = ((s.per / 100) * staked).toFixed(4)
        newArr.push(obj)
      })
      setStrategies(newArr)
    }
  }, [staked])

  useEffect(() => {
    setDetails([
      {
        title: 'Contract Address',
        value: (
          <Link href="https://bscscan.com/address/0xdf5926C9A457d61c72C1dbcBce140c1548fAE87b">
            <a target="_blank" rel="noopener noreferrer">
              Contract on BSCScan
            </a>
          </Link>
        ),
      },
      {
        title: 'IPFS JSON',
        value: metadataURL ? (
          <Link href={metadataURL}>
            <a target="_blank" rel="noopener noreferrer">
              Link to IPFS JSON
            </a>
          </Link>
        ) : (
          <Spinner />
        ),
      },
    ])
  }, [metadataURL])

  const unstake = () => {
    //Define the Unstake Function here
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        {
          <Flex sx={styles.flex_outer as ThemeUICSSObject}>
            <Flex sx={styles.flex_container as ThemeUICSSObject}>
              <Flex sx={styles.title as ThemeUICSSObject}>YBNFT #{tokenId}</Flex>
              <Flex sx={styles.flex_start_container as ThemeUICSSObject}>
                <Flex sx={styles.flex_start_inner_container as ThemeUICSSObject}>
                  <Flex sx={styles.flex_nft_name_container as ThemeUICSSObject}>
                    <Flex sx={{ flexDirection: 'column', gap: '10px' }}>
                      <Flex>
                        <Flex sx={styles.flex_column as ThemeUICSSObject}>
                          <Text sx={styles.series_name_text as ThemeUICSSObject}>SERIES NAME</Text>
                          {ybnftName ? (
                            <Text sx={styles.nft_name_text as ThemeUICSSObject}>{ybnftName}</Text>
                          ) : (
                            <Spinner />
                          )}
                          {description ? <Text sx={styles.nft_desc_text as ThemeUICSSObject}>{description}</Text> : ''}
                        </Flex>
                      </Flex>
                      <Flex sx={styles.flex_badges_row as ThemeUICSSObject}>
                        {badges.map((badge) => (
                          <Flex sx={styles.flex_badge_container as ThemeUICSSObject}>
                            <Text sx={styles.badge_title_text as ThemeUICSSObject}>{badge.title}</Text>
                            <Text sx={styles.badge_value_text}>{badge.value}</Text>
                          </Flex>
                        ))}
                      </Flex>
                    </Flex>
                    <Flex sx={styles.flex_owner_details_container as ThemeUICSSObject}>
                      {/* <Text sx={styles.owner_name_text as ThemeUICSSObject}>{owner.name}</Text> */}
                      {imageURL ? <Image src={imageURL} sx={styles.owner_image as ThemeUICSSObject} /> : ''}
                    </Flex>
                  </Flex>
                  {/* Strategy Composition */}
                  <Flex>
                    <Flex sx={styles.flex_strategy_container as ThemeUICSSObject}>
                      <Text sx={styles.strategy_title_text as ThemeUICSSObject}>Strategy Composition</Text>
                      <Flex sx={styles.flex_strategy_inner_container as ThemeUICSSObject}>
                        {strategies &&
                          strategies.map((strategy) => (
                            <Flex sx={styles.flex_strategy_details_container as ThemeUICSSObject}>
                              <Image src={strategy.image} sx={styles.strategy_detail_image as ThemeUICSSObject} />
                              <Flex sx={styles.flex_strategy_detail_column as ThemeUICSSObject}>
                                <Text sx={styles.strategy_detail_quantity_text as ThemeUICSSObject}>
                                  {strategy.name}
                                </Text>
                                {strategy.value && (
                                  <Text sx={styles.strategy_detail_value_text as ThemeUICSSObject}>
                                    ({strategy.value} BNB)
                                  </Text>
                                )}
                                <Text sx={styles.strategy_detail_apy_text as ThemeUICSSObject}>
                                  Allocation: {strategy.percentage}
                                </Text>
                              </Flex>
                            </Flex>
                          ))}{' '}
                        {!strategies || !strategies.length ? <Spinner /> : ''}
                      </Flex>
                    </Flex>

                    <Flex sx={styles.flex_staking_details as ThemeUICSSObject}>
                      <Text sx={styles.staking_sub_title_text as ThemeUICSSObject}>
                        Stake BNB to join the YB-NFT strategy
                      </Text>
                      <Flex
                        style={{
                          flexDirection: 'column',
                          backgroundColor: '#FD5298',
                          borderRadius: '24px',
                          padding: '3rem 2rem 3rem 2rem',
                        }}
                      >
                        <ActionStake tokenId={tokenId} setStaked={setStaked} />
                        <Yield tokenId={tokenId} />
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex sx={styles.flex_details_container as ThemeUICSSObject}>
                    {details.map((detail) => (
                      <Flex sx={styles.flex_inner_details_container as ThemeUICSSObject}>
                        <Text sx={styles.inner_details_title_text as ThemeUICSSObject}>{detail.title}</Text>
                        <Text sx={styles.inner_details_value_text as ThemeUICSSObject}>{detail.value}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
                <Flex sx={styles.flex_right_container as ThemeUICSSObject}>{/* Staking Details */}</Flex>
              </Flex>
            </Flex>
          </Flex>
        }
      </Box>
    </ThemeProvider>
  )
}

export default ViewContents
