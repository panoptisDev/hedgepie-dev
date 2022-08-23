import { useWeb3React } from '@web3-react/core'
import { useInvestor } from 'hooks/useInvestor'
import React, { useEffect, useState } from 'react'
import { Box, Button, Text, ThemeUICSSObject } from 'theme-ui'
import { getBalanceInEther } from 'utils/formatBalance'
import toast from 'utils/toast'
import { styles } from './styles'

function Yield(props: any) {
  const { tokenId } = props
  const { getYield, onYBNFTClaim } = useInvestor()
  const [reward, setReward] = useState(0)
  const [loading, setLoading] = useState(true)
  const { account } = useWeb3React()

  const handleWithdrawYield = async () => {
    let txHash
    try {
      txHash = await onYBNFTClaim(tokenId)
      toast(`${reward} BNB successfully withdrawn on YBNFT #${tokenId} !!`)
      fetchReward()
    } catch (err) {
      console.log(err)
    }
    console.log(txHash)
  }

  const fetchReward = async () => {
    if (!account) return
    console.log(account)
    setLoading(true)
    try {
      let pendingReward = getBalanceInEther(await getYield(tokenId))
      setReward(pendingReward)
    } catch (err) {
      toast('Error while fetching Yield ')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReward()
  }, [account])

  return (
    <>
      {reward ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '1rem',
            width: '100%',
          }}
        >
          <Box
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '9rem' }}
          >
            <Text sx={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>YIELD</Text>
            <Text sx={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{reward}</Text>
          </Box>
          <Button sx={styles.withdraw_yield_button as ThemeUICSSObject} onClick={handleWithdrawYield}>
            CLAIM
          </Button>
        </Box>
      ) : null}
    </>
  )
}

export default Yield
