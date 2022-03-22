/** @jsx jsx */
/** @jsxRuntime classic */

import { useState, useEffect } from 'react'
import { ThemeProvider, jsx, Box, Flex, Button, Text, Image, Input, ThemeUICSSObject, Badge } from 'theme-ui'

import { theme } from 'themes/theme'

import { styles } from './styles'

// TODO : Define the props type to get the NFT details in setState and useEffect and display in the UI
type Props = {}

type Badge = { title: string; value: string }
type Strategy = { image: string; quantity: string; value: string; apy: string }
type Detail = { title: string; value: string }

const ViewContents = (props: Props) => {
  const [ybnftName, setYbnftName] = useState('NFT Name #7090')
  const [badges, setBadges] = useState([] as Badge[])
  const [strategies, setStrategies] = useState([] as Strategy[])
  const [details, setDetails] = useState([] as Detail[])
  const [stakeAmount, setStakeAmount] = useState('')
  const [owner, setOwner] = useState({ name: 'OWNER', image: 'images/owner.png' })

  // Setting badges,strategies with the default values, which should later be taken from the props
  useEffect(() => {
    setBadges([
      { title: 'Collective APY', value: '500%' },
      { title: 'TLV', value: '$5000' },
      { title: 'Participants', value: '487' },
    ])
  }, [])

  useEffect(() => {
    setStrategies([
      { image: 'images/tako.svg', quantity: '1.9', value: '($1,213.95 USD)', apy: '40%' },
      { image: 'images/mountain.png', quantity: '2.2', value: '($2,430.95 USD)', apy: '100%' },
      { image: 'images/veto.png', quantity: '3.1', value: '($450.87 USD)', apy: '200%' },
      { image: 'images/tako.svg', quantity: '0.8', value: '($121.95 USD)', apy: '80%' },
      { image: 'images/tako.svg', quantity: '1.9', value: '($1,130.95 USD)', apy: '25%' },
    ])
  }, [])

  useEffect(() => {
    setDetails([
      { title: 'Contract Address', value: '0*0a89b205af4756ebc' },
      { title: 'IPFS JSON', value: 'https://cloudflare.com/testjson' },
    ])
  }, [])

  const unstake = () => {
    //Define the Unstake Function here
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <Flex sx={styles.flex_outer as ThemeUICSSObject}>
          <Flex sx={styles.flex_container as ThemeUICSSObject}>
            <Flex sx={styles.title as ThemeUICSSObject}>{ybnftName}</Flex>
            <Flex sx={styles.flex_start_container as ThemeUICSSObject}>
              <Flex sx={styles.flex_start_inner_container as ThemeUICSSObject}>
                <Flex sx={styles.flex_nft_name_container as ThemeUICSSObject}>
                  <Flex>
                    <Flex sx={styles.flex_column as ThemeUICSSObject}>
                      <Text sx={styles.series_name_text as ThemeUICSSObject}>Series Name</Text>
                      <Text sx={styles.nft_name_text as ThemeUICSSObject}>{ybnftName}</Text>
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
                {/* Strategy Composition */}
                <Flex sx={styles.flex_strategy_container as ThemeUICSSObject}>
                  <Text sx={styles.strategy_title_text as ThemeUICSSObject}>Strategy Composition</Text>
                  <Flex sx={styles.flex_strategy_inner_container as ThemeUICSSObject}>
                    {strategies.map((strategy) => (
                      <Flex sx={styles.flex_strategy_details_container as ThemeUICSSObject}>
                        <Image src={strategy.image} sx={styles.strategy_detail_image as ThemeUICSSObject} />
                        <Flex sx={styles.flex_strategy_detail_column as ThemeUICSSObject}>
                          <Text sx={styles.strategy_detail_quantity_text as ThemeUICSSObject}>{strategy.quantity}</Text>
                          <Text sx={styles.strategy_detail_value_text as ThemeUICSSObject}>({strategy.value})</Text>
                          <Text sx={styles.strategy_detail_apy_text as ThemeUICSSObject}>APY: {strategy.apy}</Text>
                        </Flex>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </Flex>
              <Flex sx={styles.flex_right_container as ThemeUICSSObject}>
                <Flex sx={styles.flex_owner_details_container as ThemeUICSSObject}>
                  <Text sx={styles.owner_name_text as ThemeUICSSObject}>{owner.name}</Text>
                  <Image src={owner.image} sx={styles.owner_image as ThemeUICSSObject} />
                </Flex>
                {/* Staking Details */}
                <Flex sx={styles.flex_staking_details as ThemeUICSSObject}>
                  <Text sx={styles.staking_sub_title_text as ThemeUICSSObject}>
                    Stake HPIE to join the YB-NFT strategy
                  </Text>

                  {/* Button Input Stake */}
                  <div sx={styles.div_button_input as ThemeUICSSObject}>
                    <Flex sx={styles.flex_button_badge as ThemeUICSSObject}>
                      <Button sx={styles.stake_button as ThemeUICSSObject}>STAKE</Button>
                      <Badge sx={styles.max_badge as ThemeUICSSObject}>MAX</Badge>
                    </Flex>
                    <Input
                      sx={styles.stake_input as ThemeUICSSObject}
                      onChange={(e) => {
                        setStakeAmount(e.target.value)
                      }}
                      maxLength={6}
                      placeholder="0.00"
                      defaultValue="0.00"
                    />
                  </div>

                  <Button sx={styles.unstake_button as ThemeUICSSObject} onClick={unstake}>
                    UNSTAKE
                  </Button>
                  <Flex sx={styles.flex_details_container as ThemeUICSSObject}>
                    <Text sx={styles.details_title_text as ThemeUICSSObject}>DETAILS:</Text>
                    {details.map((detail) => (
                      <Flex sx={styles.flex_inner_details_container as ThemeUICSSObject}>
                        <Text sx={styles.inner_details_title_text as ThemeUICSSObject}>{detail.title}:</Text>
                        <Text sx={styles.inner_details_value_text as ThemeUICSSObject}>{detail.value}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default ViewContents
