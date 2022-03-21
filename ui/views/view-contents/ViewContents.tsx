/** @jsx jsx */
/** @jsxRuntime classic */

import { useState, useEffect } from 'react'
import { ThemeProvider, jsx, Box, Flex, Button, Text, Image, Input, ThemeUICSSObject, Badge } from 'theme-ui'

import { theme } from 'themes/theme'
import { VscSettings } from 'react-icons/vsc'
import { AiOutlineArrowRight } from 'react-icons/ai'

import { styles } from './styles'

// TODO : Define the props type to get the NFT details and display in the UI
type Props = {}

const ViewContents = (props: Props) => {
  const [ybnftName, setYbnftName] = useState('NFT Name #7090')
  const [collectiveApy, setCollectiveApy] = useState('500%')
  const [tlv, setTlv] = useState('$5000')
  const [participants, setParticipants] = useState('487')
  const [composition, setComposition] = useState([])
  const [contractAddress, setContractAddress] = useState('0x0a89b205d3827saf4')
  const [ipfsJson, setIpfsJson] = useState('https://cloudflare.com/testjson')
  const [stakeAmount, setStakeAmount] = useState('')
  const [owner, setOwner] = useState('OWNER')

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <Flex sx={styles.flex_outer as ThemeUICSSObject}>
          <Flex sx={styles.flex_container as ThemeUICSSObject}>
            <Flex sx={styles.title as ThemeUICSSObject}>{ybnftName}</Flex>
            <Flex css={{ alignItems: 'flex-start', justifyContent: 'flex-start', padding: '40px', gap: '30px' }}>
              <Flex css={{ width: '50rem', flexDirection: 'column', gap: '2rem' }}>
                <Flex css={{ flexDirection: 'column', gap: '0.5rem' }}>
                  <Flex>
                    <Flex css={{ flexDirection: 'column' }}>
                      <Text css={{ color: '#DF4886', fontSize: '20px', fontWeight: '500' }}>Series Name</Text>
                      <Text css={{ color: '#16103A', fontWeight: '700', fontSize: '28px' }}>{ybnftName}</Text>
                    </Flex>
                  </Flex>
                  <Flex css={{ flexDirection: 'row', gap: '15px' }}>
                    <Flex
                      css={{
                        border: '2px solid #D8D8D8',
                        borderRadius: '30px',
                        padding: '0 10px 0 10px',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text css={{ color: '#8E8DA0', fontWeight: '600' }}>Collective APY:</Text>
                      <Text css={{ color: '#0A3F5C' }}>{collectiveApy}</Text>
                    </Flex>
                    <Flex
                      css={{
                        border: '2px solid #D8D8D8',
                        borderRadius: '30px',
                        padding: '0 10px 0 10px',
                      }}
                    >
                      <Text css={{ color: '#8E8DA0', fontWeight: '600' }}>TLV:</Text>
                      <Text css={{ color: '#0A3F5C' }}>{tlv}</Text>
                    </Flex>
                    <Flex
                      css={{
                        border: '1px solid #D8D8D8',
                        borderRadius: '30px',
                        padding: '0 10px 0 10px',
                      }}
                    >
                      <Text css={{ color: '#8E8DA0', fontWeight: '600' }}>Participants:</Text>
                      <Text css={{ color: '#0A3F5C' }}>{participants}</Text>
                    </Flex>
                  </Flex>
                </Flex>
                {/* Strategy Composition */}
                <Flex
                  css={{
                    flexDirection: 'column',
                    border: '1px solid rgba(142, 141, 160, 0.42)',
                    borderRadius: '10px',
                    padding: '20px',
                    gap: '20px',
                  }}
                >
                  <Text css={{ fontWeight: '700', fontSize: '24px' }}>Strategy Composition</Text>
                  <Flex css={{ gap: '15px', flexWrap: 'wrap', width: '40rem' }}>
                    <Flex
                      css={{
                        backgroundColor: '#E5F6FF',
                        borderRadius: '8px',
                        width: '200px',
                        height: '100px',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '2px',
                      }}
                    >
                      <Image src="images/tako.svg" css={{ width: '50px', height: '50px' }} />
                      <Flex css={{ flexDirection: 'column', gap: '5px' }}>
                        <Text css={{ fontWeight: '700', fontSize: '22px', color: '#0A3F5C' }}>1.9</Text>
                        <Text css={{ color: '#8E8DA0', fontSize: '14px', fontWeight: '500' }}>(1,213.95 USD)</Text>
                        <Text css={{ color: '#0A3F5C', fontFamily: 'Noto Sans', fontWeight: '600', fontSize: '16px' }}>
                          APY: 40%
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex
                      css={{
                        backgroundColor: '#E5F6FF',
                        borderRadius: '8px',
                        width: '200px',
                        height: '100px',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '2px',
                      }}
                    >
                      <Image src="images/mountain.png" css={{ width: '50px', height: '50px' }} />
                      <Flex css={{ flexDirection: 'column' }}>
                        <Text css={{ fontWeight: '700', fontSize: '22px', color: '#0A3F5C' }}>1.9</Text>
                        <Text css={{ color: '#8E8DA0', fontSize: '14px', fontWeight: '500' }}>(1,213.95 USD)</Text>
                        <Text css={{ color: '#0A3F5C', fontFamily: 'Noto Sans', fontWeight: '600', fontSize: '16px' }}>
                          APY: 100%
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex
                      css={{
                        backgroundColor: '#E5F6FF',
                        borderRadius: '8px',
                        width: '200px',
                        height: '100px',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '2px',
                      }}
                    >
                      <Image src="images/veto.png" css={{ width: '50px', height: '50px' }} />
                      <Flex css={{ flexDirection: 'column' }}>
                        <Text css={{ fontWeight: '700', fontSize: '22px', color: '#0A3F5C' }}>1.9</Text>
                        <Text css={{ color: '#8E8DA0', fontSize: '14px', fontWeight: '500' }}>(1,213.95 USD)</Text>
                        <Text css={{ color: '#0A3F5C', fontFamily: 'Noto Sans', fontWeight: '600', fontSize: '16px' }}>
                          APY: 40%
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex
                      css={{
                        backgroundColor: '#E5F6FF',
                        borderRadius: '8px',
                        width: '200px',
                        height: '100px',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '2px',
                      }}
                    >
                      <Image src="images/tako.svg" css={{ width: '50px', height: '50px' }} />
                      <Flex css={{ flexDirection: 'column' }}>
                        <Text css={{ fontWeight: '700', fontSize: '22px', color: '#0A3F5C' }}>1.9</Text>
                        <Text css={{ color: '#8E8DA0', fontSize: '14px', fontWeight: '500' }}>(1,213.95 USD)</Text>
                        <Text css={{ color: '#0A3F5C', fontFamily: 'Noto Sans', fontWeight: '600', fontSize: '16px' }}>
                          APY: 40%
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex
                      css={{
                        backgroundColor: '#E5F6FF',
                        borderRadius: '8px',
                        width: '200px',
                        height: '100px',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '2px',
                      }}
                    >
                      <Image src="images/tako.svg" css={{ width: '50px', height: '50px' }} />
                      <Flex css={{ flexDirection: 'column' }}>
                        <Text css={{ fontWeight: '700', fontSize: '22px', color: '#0A3F5C' }}>1.9</Text>
                        <Text css={{ color: '#8E8DA0', fontSize: '14px', fontWeight: '500' }}>(1,213.95 USD)</Text>
                        <Text css={{ color: '#0A3F5C', fontFamily: 'Noto Sans', fontWeight: '600', fontSize: '16px' }}>
                          APY: 100%
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex css={{ flexDirection: 'column', width: '30rem', gap: '1rem' }}>
                <Flex
                  css={{
                    flexDirection: 'row',
                    gap: '10px',
                    alignItems: 'center',
                    marginLeft: 'auto',
                  }}
                >
                  <Text css={{ fontSize: '20px', fontWeight: '700', color: '#ABABAB' }}>{owner}</Text>
                  <Image src="images/owner.png" css={{ width: '80px', height: '80px' }} />
                </Flex>
                {/* Staking Details */}
                <Flex css={{ alignItems: 'center', justifyContent: 'center', gap: '1rem', flexDirection: 'column' }}>
                  <Text css={{ fontFamily: 'Noto Sans', fontSize: '16px', fontWeight: '600', color: '#8E8DA0' }}>
                    Stake HPIE to join the YB-NFT strategy
                  </Text>

                  {/* Button Input Stake */}
                  <div
                    css={{
                      position: 'relative',
                      width: '100%',
                      overflow: 'hidden',
                      marginBottom: '10px',
                      backgroundColor: '#E5F6FF',
                      borderRadius: '31px',
                    }}
                  >
                    <Flex css={{ position: 'absolute', marginTop: 0, height: '100%', gap: '10px', zIndex: '1' }}>
                      <Button
                        css={{
                          position: 'relative',
                          height: '100%',
                          borderRadius: '40px',
                          width: '200px',
                          padding: '0px 20px',
                          lineHeight: '48px',
                          fontSize: '18px',
                          fontWeight: '600',
                          opacity: '0.8',
                          backgroundColor: '#1799DE',
                          color: '#fff',
                          cursor: 'pointer',
                          ':hover': {
                            border: '2px solid rgb(157 83 182)',
                            color: 'rgb(157 83 182)',
                          },
                        }}
                      >
                        STAKE
                      </Button>
                      <Badge
                        css={{
                          width: 'fit-content',
                          height: 'fit-content',
                          alignSelf: 'center',
                          backgroundColor: 'rgba(160, 160, 160, 0.32)',
                          borderRadius: '4px',
                          color: '#8E8DA0',
                          fontWeight: '300',
                        }}
                      >
                        MAX
                      </Badge>
                    </Flex>
                    <Input
                      css={{
                        position: 'relative',
                        height: '56px',
                        borderRadius: '30px',
                        minWidth: '30rem',
                        boxShadow: 'none',
                        border: 'none',
                        outline: 0,
                        fontSize: '16px',
                        paddingRight: '1rem',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#E5F6FF',
                      }}
                      maxLength={6}
                      placeholder="0.00"
                      defaultValue="0.00"
                    />
                  </div>

                  <Button
                    css={{
                      backgroundColor: '#fff',
                      border: '2px solid #1799DE',
                      borderRadius: '50px',
                      color: '#1799DE',
                      fontFamily: 'Noto Sans',
                      height: '3rem',
                      width: '100%',
                      fontWeight: '600',
                    }}
                  >
                    UNSTAKE
                  </Button>
                  <Flex
                    css={{
                      flexDirection: 'column',
                      gap: '1rem',
                      alignSelf: 'flex-start',
                      marginLeft: '1rem',
                    }}
                  >
                    <Text css={{ fontSize: '16px', fontWeight: '600', fontFamily: 'Noto Sans', color: '#8E8DA0' }}>
                      DETAILS:
                    </Text>
                    <Flex
                      css={{
                        backgroundColor: '#F5F5F5',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        padding: '0.2rem',
                        width: '20rem',
                      }}
                    >
                      <Text
                        css={{
                          color: '#0A3F5C',
                          fontFamily: 'Noto Sans',
                          fontStyle: 'normal',
                          fontWeight: 600,
                          fontSize: '16px',
                          lineHeight: '150%',
                        }}
                      >
                        Contract Address:
                      </Text>
                      <Text
                        css={{
                          color: '#8E8DA0',
                          fontFamily: 'Noto Sans',
                          fontStyle: 'normal',
                          fontWeight: 600,
                          fontSize: '16px',
                          lineHeight: '150%',
                        }}
                      >
                        {contractAddress}
                      </Text>
                    </Flex>
                    <Flex
                      css={{
                        backgroundColor: '#F5F5F5',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        padding: '0.2rem',
                        width: '20rem',
                      }}
                    >
                      <Text
                        css={{
                          color: '#0A3F5C',
                          fontFamily: 'Noto Sans',
                          fontStyle: 'normal',
                          fontWeight: 600,
                          fontSize: '16px',
                          lineHeight: '150%',
                        }}
                      >
                        IPFS JSON:
                      </Text>
                      <Text
                        css={{
                          color: '#8E8DA0',
                          fontFamily: 'Noto Sans',
                          fontStyle: 'normal',
                          fontWeight: 600,
                          fontSize: '16px',
                          lineHeight: '150%',
                        }}
                      >
                        {ipfsJson}
                      </Text>
                    </Flex>
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
