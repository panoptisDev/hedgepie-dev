/** @jsx jsx */
/** @jsxRuntime classic */

import { useState, useEffect } from 'react'
import { ThemeProvider, jsx, Box, Flex, Button, Text, Image, Input, Select } from 'theme-ui'

import { theme } from 'themes/theme'
import { VscSettings } from 'react-icons/vsc'
import { AiOutlineArrowRight } from 'react-icons/ai'

type Props = {}

const Swap = (props: Props) => {
  const [swapTokenType, setSwapTokenType] = useState('')
  const [tokenQuantity, setTokenQuantity] = useState(0)
  const [HPIEQuantity, setHPIEQuantity] = useState(0)
  const [slippageTolerance, setSlippageTolerance] = useState(0)

  // Function called on clicking Swap
  const swap = () => {
    console.log('Swap Token Type : ' + swapTokenType)
    console.log('Swap Token Quantity : ' + tokenQuantity)
    console.log('HPIE Quantity : ' + HPIEQuantity)
    console.log('Slippage Tolerance : ' + slippageTolerance)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Flex
            sx={{
              width: '75rem',
              marginTop: '3rem',
              boxShadow: '0px 25px 55px rgba(209, 208, 219, 0.4)',
              flexDirection: 'column',
            }}
          >
            <Flex
              sx={{
                height: '5rem',
                alignItems: 'center',
                paddingLeft: '2rem',
                backgroundColor: '#1799DE',
                color: '#fff',
                fontWeight: '600',
                fontFamily: 'Poppins',
                fontSize: '26px',
              }}
            >
              Swap for HPIE
            </Flex>
            <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Flex
                sx={{
                  margin: '1rem',
                  flexDirection: 'column',
                  backgroundColor: '#E5F6FF',
                  borderRadius: '6px',
                  width: '80%',
                  padding: '0rem 3rem',
                  paddingBottom: '5rem',
                }}
              >
                <Flex sx={{ flexDirection: 'row', marginBottom: '1rem', marginTop: '1rem' }}>
                  <Text
                    sx={{
                      fontFamily: 'Noto Sans',
                      fontWeight: '600',
                      fontSize: '16px',
                      color: '#DF4886',
                    }}
                  >
                    Trade tokens instantly for HPIE
                  </Text>
                  <VscSettings
                    sx={{
                      color: '#1799DE',
                      width: '1.5rem',
                      height: '1.5rem',
                      marginLeft: 'auto',
                      marginRight: '2rem',
                    }}
                  />
                </Flex>
                <Flex sx={{ gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <Image src="images/tako.svg" sx={{ width: '50px', height: '50px' }} />
                  <Select
                    defaultValue="Type"
                    onChange={(e) => setSwapTokenType(e.target.value)}
                    sx={{
                      borderRadius: '10rem',
                      outline: 'none',
                      border: 0,
                      height: '50px',
                      paddingInlineEnd: '24px',
                      flex: 1,
                      width: '6rem',
                      fontSize: '22px',
                      fontWeight: '600',
                      color: '#0A3F5C',
                      marginBottom: '2px',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      marginTop: '5px',
                      paddingLeft: '10px',
                    }}
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
                    sx={{
                      borderRadius: '30px',
                      width: '15rem',
                      boxShadow: 'none',
                      border: 'none',
                      outline: 0,
                      paddingLeft: '1rem',
                      color: '#0A3F5C',
                      backgroundColor: '#fff',
                      fontSize: '30px',
                      fontWeight: '700',
                      textAlign: 'right',
                      paddingRight: '1.5rem',
                    }}
                  />

                  <Flex
                    sx={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#DF4886',
                      padding: '0.3rem',
                      borderRadius: '50px',
                    }}
                  >
                    <AiOutlineArrowRight sx={{ width: '2rem', height: '2rem', color: '#fff' }} />
                  </Flex>
                  <Image src="images/logo.png" sx={{ width: '60px', height: '50px' }} />
                  <Select
                    defaultValue="HPIE"
                    sx={{
                      borderRadius: '10rem',
                      outline: 'none',
                      border: 0,
                      height: '50px',
                      paddingInlineEnd: '24px',
                      flex: 1,
                      width: '6rem',
                      fontSize: '22px',
                      fontWeight: '600',
                      color: '#0A3F5C',
                      marginBottom: '2px',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      marginTop: '5px',
                      paddingLeft: '10px',
                    }}
                  >
                    <option>HPIE</option>
                  </Select>
                  <Input
                    defaultValue={'1.9'}
                    onChange={(e) => {
                      setHPIEQuantity(Number(e.target.value))
                    }}
                    sx={{
                      borderRadius: '30px',
                      width: '15rem',
                      boxShadow: 'none',
                      border: 'none',
                      outline: 0,
                      paddingLeft: '1rem',
                      color: '#0A3F5C',
                      backgroundColor: '#fff',
                      fontSize: '30px',
                      fontWeight: '700',
                      textAlign: 'right',
                      paddingRight: '1.5rem',
                    }}
                  />
                </Flex>
                <Flex sx={{ marginLeft: '55%', alignItems: 'center', gap: '0.5rem' }}>
                  <Text sx={{ color: '#8E8DA0', fontWeight: '600', fontSize: '16px', fontFamily: 'Noto Sans' }}>
                    Slippage Tolerance:
                  </Text>
                  <Input
                    defaultValue={'0.5%'}
                    onChange={(e) => {
                      setSlippageTolerance(Number(e.target.value))
                    }}
                    sx={{
                      borderRadius: '30px',
                      width: '5rem',
                      boxShadow: 'none',
                      border: 'none',
                      outline: 0,
                      paddingLeft: '1rem',
                      color: '#EFA906',
                      backgroundColor: '#fff',
                      fontSize: '16px',
                      fontWeight: '700',
                      textAlign: 'center',
                      paddingRight: '1.5rem',
                    }}
                  />
                </Flex>
              </Flex>
              <Button
                sx={{
                  margin: '1rem',
                  marginBottom: '4rem',
                  cursor: 'pointer',
                  backgroundColor: '#1799DE',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  height: '4rem',
                  width: '50%',
                  borderRadius: '30px',
                  letterSpacing: '0.2rem',
                }}
                onClick={swap}
              >
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
