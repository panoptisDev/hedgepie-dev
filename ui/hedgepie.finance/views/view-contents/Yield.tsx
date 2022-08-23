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
    <Box sx={styles.yield_container as ThemeUICSSObject}>
      <Box sx={styles.yield_inner_container as ThemeUICSSObject}>
        <Text sx={styles.yield_inner_text}>YIELD</Text>
        <Text sx={styles.yield_inner_text}>500 BNB</Text>
      </Box>
      <Button sx={styles.withdraw_yield_button as ThemeUICSSObject} onClick={handleWithdrawYield}>
        WITHDRAW YIELD
      </Button>
    </Box>
  )
}

export default Yield
