/** @jsx jsx */
/** @jsxRuntime classic */

import { useState, useEffect } from 'react'
import { ThemeProvider, jsx, Box, Flex, Button, Text, Image, Input, Select, ThemeUICSSObject } from 'theme-ui'

import { theme } from 'themes/theme'
import { VscSettings } from 'react-icons/vsc'
import { AiOutlineArrowRight } from 'react-icons/ai'

import { styles } from './styles'

type Props = {}

const Swap = (props: Props) => {
  const [swapTokenType, setSwapTokenType] = useState('')
  const [tokenQuantity, setTokenQuantity] = useState(0)
  const [hpieQuantity, setHpieQuantity] = useState(0)
  const [slippageTolerance, setSlippageTolerance] = useState(0)

  // Function called on clicking Swap
  const swap = () => {
    console.log('Swap Token Type : ' + swapTokenType)
    console.log('Swap Token Quantity : ' + tokenQuantity)
    console.log('HPIE Quantity : ' + hpieQuantity)
    console.log('Slippage Tolerance : ' + slippageTolerance)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <Flex sx={styles.flex_outer as ThemeUICSSObject}>
          <Flex sx={styles.flex_container as ThemeUICSSObject}>
            <Flex sx={styles.title as ThemeUICSSObject}>Swap for HPIE</Flex>
            <Flex sx={styles.flex_column as ThemeUICSSObject}>
              <Flex sx={styles.flex_inner_container as ThemeUICSSObject}>
                <Flex sx={styles.flex_sub_title as ThemeUICSSObject}>
                  <Text sx={styles.sub_title_text as ThemeUICSSObject}>Trade tokens instantly for HPIE</Text>
                  <VscSettings sx={styles.filter_icon as ThemeUICSSObject} />
                </Flex>
                <Flex sx={styles.flex_swap_details as ThemeUICSSObject}>
                  <Image src="images/tako.svg" sx={styles.swap_token_image as ThemeUICSSObject} />
                  <Select
                    defaultValue="Type"
                    onChange={(e) => setSwapTokenType(e.target.value)}
                    sx={styles.swap_token_select as ThemeUICSSObject}
                  >
                    <option>Tako</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                    <option>Option 4</option>
                  </Select>
                  <Input
                    defaultValue={'10'}
                    onChange={(e) => {
                      setTokenQuantity(Number(e.target.value))
                    }}
                    sx={styles.swap_token_input as ThemeUICSSObject}
                  />

                  <Flex sx={styles.flex_arrow_container as ThemeUICSSObject}>
                    <AiOutlineArrowRight sx={styles.arrow_icon as ThemeUICSSObject} />
                  </Flex>
                  <Image src="images/logo.png" sx={styles.hpie_token_image as ThemeUICSSObject} />
                  <Select defaultValue="HPIE" sx={styles.swap_token_select as ThemeUICSSObject}>
                    <option>HPIE</option>
                  </Select>
                  <Input
                    defaultValue={'1.9'}
                    onChange={(e) => {
                      setHpieQuantity(Number(e.target.value))
                    }}
                    sx={styles.swap_token_input as ThemeUICSSObject}
                  />
                </Flex>
                <Flex sx={styles.flex_slippage_tolerance as ThemeUICSSObject}>
                  <Text sx={styles.slippage_tolerance_text as ThemeUICSSObject}>Slippage Tolerance:</Text>
                  <Input
                    defaultValue={'0.5%'}
                    onChange={(e) => {
                      setSlippageTolerance(Number(e.target.value))
                    }}
                    sx={styles.slippage_tolerance_input as ThemeUICSSObject}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </Flex>
              </Flex>
              <Button sx={styles.swap_button as ThemeUICSSObject} onClick={swap}>
                SWAP
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default Swap
