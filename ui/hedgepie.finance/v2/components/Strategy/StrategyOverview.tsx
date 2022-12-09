import { useWeb3React } from '@web3-react/core'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { useInvestor } from 'hooks/useInvestor'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { Box, Input, Spinner, Text } from 'theme-ui'
import { getBalanceInEther, getBalanceInWei } from 'utils/formatBalance'
import { getPrice } from 'utils/getTokenPrice'
import toast from 'utils/toast'

function StrategyOverview(props: { tokenId: number }) {
  const { tokenId } = props
  const [loading, setLoading] = useState(false)
  const [fundName, setFundName] = useState('')
  const [createdDate, setCreatedDate] = useState('14/09/2022')
  const [description, setDescription] = useState(
    'Descriptive text for the Fund goes here. Any relevant information will be displayed.',
  )
  const [performanceFee, setPerformanceFee] = useState('5.15%')
  const [rating, setRating] = useState('5.2')
  const [reward, setReward] = useState('$5,150')
  const [rewardBNB, setRewardBNB] = useState(0)
  const [stakeAmt, setStakeAmt] = useState(0)
  const [stake, setStake] = useState('15 BNB')
  const [stakeUSD, setStakeUSD] = useState('$10,580 USD')
  const [tvl, setTVL] = useState('$245,301')
  const [apy, setAPY] = useState('12%')
  const [investors, setInvestors] = useState('400')

  const [bnbBalance, setBNBBalance] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [amount, setAmount] = useState<number | BigNumber>(0.0)
  const [amountString, setAmountString] = useState('0.00')

  const [currentStaked, setCurrentStaked] = useState<any>()

  const [invalidAmount, setInvalidAmount] = useState(false)

  const { getNFTInfo, getYield, getBalance, onYBNFTDeposit, onYBNFTWithdraw, onYBNFTClaim } = useInvestor()
  const { getTokenUri, getPerfFee } = useYBNFTMint()
  const { account } = useWeb3React()

  const fetchOverview = async () => {
    setLoading(true)
    const nftInfo = await getNFTInfo(tokenId)
    const bnbPrice = await getPrice('BNB')
    const tvl = bnbPrice ? `$ ${Number(getBalanceInEther(nftInfo.tvl) * bnbPrice).toFixed(3)} USD` : 'N/A'
    const totalStaked = `${getBalanceInEther(nftInfo.tvl)} BNB`
    const totalParticipants = nftInfo.totalParticipant
    let invested = await getBalance(tokenId)
    console.log('Invested 123 : ' + invested)
    let reward = Number(invested) !== 0 ? await getYield(tokenId) : 0.0
    console.log('Reward')
    let perfFee = await getPerfFee(tokenId)
    console.log('invested:' + invested)
    const tokenUri = await getTokenUri(tokenId)
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

    // Setting the State Variables
    setFundName(metadata.name)
    setDescription(metadata.description)
    setTVL(tvl)
    setStakeAmt(getBalanceInEther(Number(invested)))
    setStake(`${getBalanceInEther(Number(invested))} BNB`)
    setStakeUSD(`$${(getBalanceInEther(Number(invested)) * (bnbPrice ? bnbPrice : 0)).toFixed(3)} USD`)

    setReward(`${getBalanceInEther(Number(reward)).toFixed(5)} BNB`)
    setRewardBNB(getBalanceInEther(Number(reward)))
    setInvestors(totalParticipants)
    setPerformanceFee(`${perfFee / 100} %`)
    setLoading(false)
  }

  useEffect(() => {
    if (!tokenId) return

    account && fetchOverview()
  }, [tokenId, account])

  // Functions needed for Staking and Withdraw

  const getBNBBalance = async () => {
    const balance = await axios.get(
      'https://api.bscscan.com/api?module=account&action=balance&address=' +
        account?.toString() +
        '&apikey=ZWKTR3X6EIE91YMHQ8RNUDHADI1795JXE1',
    )
    const balanceNumber = Number(balance?.data?.result)
    console.log(balanceNumber)
    setBNBBalance(getBalanceInEther(new BigNumber(balanceNumber)))
  }

  useEffect(() => {
    account && getBNBBalance()
  }, [account])

  const onChangeAmount = (e) => {
    setAmountString(e.target.value)
    if (e.target.value && (isNaN(e.target.value) || Number.parseFloat(e.target.value) < 0)) {
      setInvalidAmount(true)
      toast('Please input only Positive Numeric values', 'warning')
    }
    setInvalidAmount(false)
    if (account && Number.parseFloat(e.target.value) >= bnbBalance) {
      toast('Entered amount is greater than available BNB balance.', 'warning')
    }
    e.target.value && !isNaN(e.target.value) && setAmount(getBalanceInWei(Number.parseFloat(e.target.value)))
  }

  const handleStake = async () => {
    console.log(amount.valueOf())
    if (amount.valueOf() == 0) {
      toast('Please input a Non-Zero value to Stake', 'warning')
      return
    }
    let txHash
    try {
      txHash = await onYBNFTDeposit(tokenId, amount.toString())
      toast(`${amountString} BNB successfully staked on YBNFT #${tokenId} !!`)
      setAmountString('0.0')
      setAmount(0.0)
      fetchOverview()
    } catch (err) {
      toast('Staking Transaction Rejected 😅', 'warning')
      console.log(err)
    }
    console.log(txHash)
  }

  const handleUnstake = async () => {
    if (!account) {
      toast('Please connect your wallet to view the Staked amount and Withdraw !!', 'warning')
      return
    }
    if (currentStaked === 0) {
      toast('No staked BNB currently to Withdraw !!', 'warning')
      return
    }
    let txHash
    try {
      txHash = await onYBNFTWithdraw(tokenId)
      fetchOverview()
      toast(`${currentStaked} BNB successfully withdrawn on YBNFT #${tokenId} !!`)
    } catch (err) {
      toast('Withdrawal Transaction Rejected 😅', 'warning')
      console.log(err)
    }
    console.log(txHash)
  }

  const handleClaim = async () => {
    if (!account) {
      toast('Please connect your wallet to view the Staked amount and Withdraw !!', 'warning')
      return
    }
    if (rewardBNB === 0) {
      toast('No staked BNB currently to claim !!', 'warning')
      return
    }
    let txHash
    try {
      txHash = await onYBNFTClaim(tokenId)
      fetchOverview()
      toast(`${reward} BNB successfully claimed on YBNFT #${tokenId} !!`)
    } catch (err) {
      toast('Claim Transaction Rejected 😅', 'warning')
      console.log(err)
    }
    console.log(txHash)
  }

  const onInputKeyPress = (e) => {
    if (e.which == '-'.charCodeAt(0)) {
      e.preventDefault()
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title Section */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '500', fontSize: '20px', color: '#000000' }}>
          Overview/
        </Text>
        <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '24px', color: '#000000' }}>
          Strategy Details
        </Text>
      </Box>
      <Box
        sx={{
          borderRadius: '16px',
          boxShadow: '-1px 1px 8px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid #D9D9D9',
          width: '100%',
          display: 'flex',
          flexDirection: ['column', 'column', 'column', 'row'],
          gap: '5px',
          background: '#FFFFFF',
          padding: '0.5rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            border: '1px solid #D9D9D9',
            borderRadius: '16px',
            padding: '0.5rem',
            flex: 1,
          }}
        >
          {loading ? (
            <Box
              sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Spinner />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '1rem' }}>
                <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600', fontSize: '20px', color: '#000000' }}>
                  {fundName}
                </Text>
                {/* <Text
                  sx={{
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: '500',
                    fontSize: '16px',
                    color: '#4F4F4F',
                    marginLeft: 'auto',
                  }}
                >
                  Created: {createdDate}
                </Text> */}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: '3px',
                  backgroundColor: '#D9D9D9',
                }}
              ></Box>
              <Box sx={{ maxWidth: '28rem' }}>
                <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '500', fontSize: '16px', color: '#4F4F4F' }}>
                  {description}
                </Text>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                  {/* <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      flex: 1,
                      backgroundColor: '#FFEEC8',
                      borderRadius: '4px',
                      padding: '0.5rem',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Text sx={{ color: '#475569', fontFamily: 'Plus Jakarta Sans', fontSize: '14px' }}>RATING</Text>
                      <Box sx={{ marginLeft: 'auto', cursor: 'pointer' }}>
                        <Image src="/icons/info.svg" width={15} height={15} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '2px', alignItems: 'center' }}>
                      <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{rating}</Text>

                      <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '16px' }}>/</Text>

                      <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '16px', marginBottom: '-3px' }}>
                        10
                      </Text>
                    </Box>
                  </Box> */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      flex: 1,
                      backgroundColor: '#F3F3F3',
                      borderRadius: '4px',
                      padding: '0.5rem',
                    }}
                  >
                    <Text sx={{ color: '#475569', fontFamily: 'Plus Jakarta Sans', fontSize: '14px' }}>
                      Performance Fee
                    </Text>
                    <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{performanceFee}</Text>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      flex: 1,
                      backgroundColor: '#F3F3F3',
                      borderRadius: '4px',
                      padding: '0.5rem',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Text sx={{ color: '#475569', fontFamily: 'Plus Jakarta Sans', fontSize: '14px' }}>APY</Text>
                      <Box sx={{ marginLeft: 'auto', cursor: 'pointer' }}>
                        <Image src="/icons/info.svg" width={15} height={15} />
                      </Box>
                    </Box>
                    <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{apy}</Text>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      flex: 1,
                      backgroundColor: '#F3F3F3',
                      borderRadius: '4px',
                      padding: '0.5rem',
                    }}
                  >
                    <Text sx={{ color: '#475569', fontFamily: 'Plus Jakarta Sans', fontSize: '14px' }}>
                      # Investors
                    </Text>
                    <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{investors}</Text>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      flex: 1,
                      backgroundColor: '#F3F3F3',
                      borderRadius: '4px',
                      padding: '0.5rem',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Text sx={{ color: '#475569', fontFamily: 'Plus Jakarta Sans', fontSize: '14px' }}>TVL</Text>
                      <Box sx={{ marginLeft: 'auto', cursor: 'pointer' }}>
                        <Image src="/icons/info.svg" width={15} height={15} />
                      </Box>
                    </Box>
                    <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{tvl}</Text>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      flex: 1,
                      backgroundColor: '#F3F3F3',
                      borderRadius: '4px',
                      padding: '0.5rem',
                    }}
                  >
                    <Text sx={{ color: '#475569', fontFamily: 'Plus Jakarta Sans', fontSize: '14px' }}>Your Stake</Text>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Text sx={{ color: '#1A1A1A', fontWeight: '600', fontSize: '22px' }}>{stake}</Text>
                      <Text sx={{ color: '#DF4886', fontWeight: '500', fontSize: '14px', marginLeft: '3px' }}>
                        {stakeUSD}
                      </Text>
                      {/* {stakeAmt > 0 && (
                        <Text
                          sx={{
                            color: '#1799DE',
                            fontWeight: '500',
                            fontSize: '14px',
                            marginLeft: 'auto',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                          }}
                          onClick={handleUnstake}
                        >
                          Withdraw
                        </Text>
                      )} */}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '0.5rem',
            width: '100%',
            flex: 1,
          }}
        >
          {/* <Box
            sx={{
              borderRadius: '8px',
              border: '1px solid #D9D9D9',
              background: '#F3F3F3',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              padding: '0.5rem',
            }}
          >
            <Text sx={{ color: '#14114B', fontWeight: '600', fontFamily: 'Plus Jakarta Sans', fontSize: '16px' }}>
              Edit History
            </Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px' }}>Recent edit Description</Text>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
                  2 days Ago
                </Text>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px' }}>Recent edit Description</Text>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
                  2 days Ago
                </Text>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px' }}>Recent edit Description</Text>
                <Text sx={{ color: '#4F4F4F', fontSize: '14px', fontWeight: '600', marginLeft: 'auto' }}>
                  2 days Ago
                </Text>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px', cursor: 'pointer' }}>
                <Text
                  sx={{
                    color: '#1A1A1A',
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: '600',
                    fontSize: '12px',
                    ':hover': { textDecorationLine: 'underline' },
                  }}
                >
                  View More
                </Text>
              </Box>
              <Box></Box>
            </Box>
          </Box> */}
          <Box
            sx={{
              borderRadius: '8px',
              backgroundColor: '#14114B',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#201D54',
                borderRadius: '4px',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}
            >
              <Text sx={{ fontSize: '16px', fontFamily: 'Plus Jakarta Sans', color: '#94A3B8' }}>
                Stake into {fundName}
              </Text>
              <Box
                sx={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', paddingRight: '1rem' }}
              >
                <Input
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: '600',
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '24px',
                    backgroundColor: '#413d85',
                    textAlign: 'right',
                  }}
                  placeholder="0.0"
                  value={amountString}
                  type="number"
                  pattern="/^[0-9.]+$/"
                  onChange={onChangeAmount}
                  id="amount-input"
                  onKeyPress={onInputKeyPress}
                  onWheel={(e) => e.currentTarget.blur()}
                />
                <Text sx={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'Plus Jakarta Sans', fontSize: '24px' }}>
                  BNB
                </Text>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: '10px', flexDirection: 'row', alignItems: 'center' }}>
              <Box
                sx={{
                  cursor: 'pointer',
                  backgroundColor: '#201D54',
                  color: '#FFFFFF',
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #EFA3C2',
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: '600',
                  boxShadow: 'rgba(49, 59, 200, 0.8) 0px 3px 16px 0px',
                }}
                onClick={handleStake}
              >
                STAKE
              </Box>
              {/* <Box
                sx={{
                  cursor: 'pointer',
                  background: 'linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)',
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: 'Plus Jakarta Sans',
                }}
              >
                COMPOUND
              </Box> */}
            </Box>
          </Box>
          <Box>
            {stakeAmt > 0 && (
              <Box
                sx={{
                  cursor: 'pointer',
                  backgroundColor: '#201D54',
                  color: '#FFFFFF',
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #EFA3C2',
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: 'Plus Jakarta Sans',
                  fontWeight: '600',
                  boxShadow: 'rgba(49, 59, 200, 0.8) 0px 3px 16px 0px',
                }}
                onClick={handleUnstake}
              >
                WITHDRAW
              </Box>
            )}
          </Box>
          <Box
            sx={{
              borderRadius: '8px',
              backgroundColor: '#14114B',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#201D54',
                borderRadius: '4px',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}
            >
              <Text sx={{ fontSize: '16px', fontFamily: 'Plus Jakarta Sans', color: '#94A3B8' }}>Your Yield</Text>
              <Text sx={{ color: '#EFA906', fontWeight: '600', fontFamily: 'Plus Jakarta Sans', fontSize: '24px' }}>
                {reward}
              </Text>
            </Box>
            <Box sx={{ display: 'flex', gap: '10px', flexDirection: 'row', alignItems: 'center' }}>
              {rewardBNB > 0 && (
                <Box
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: '#14114B',
                    color: '#FFFFFF',
                    padding: '0.4rem 1rem',
                    borderRadius: '8px',
                    border: '2px solid #EFA3C2',
                    flex: 1,
                    textAlign: 'center',
                    fontFamily: 'Plus Jakarta Sans',
                  }}
                  onClick={handleClaim}
                >
                  CLAIM
                </Box>
              )}
              {/* <Box
                sx={{
                  cursor: 'pointer',
                  background: 'linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)',
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: 'Plus Jakarta Sans',
                }}
              >
                COMPOUND
              </Box> */}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default StrategyOverview
