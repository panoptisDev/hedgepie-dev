import { useCallback, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useDispatch } from 'react-redux'
import { useInvestorContract } from 'hooks/useContract'
import { depositOnYBNFT, withdrawFromYBNFT } from 'utils/callHelpers'

export const useInvestor = () => {
  const { account } = useWeb3React()
  const investorContract = useInvestorContract()

  const handleDeposit = useCallback(
    async (ybnftId, token, amount) => {
      const txHash = await depositOnYBNFT(investorContract, account, ybnftId, token, amount)
      console.info(txHash)
    },
    [account, investorContract],
  )

  const handleWithdraw = useCallback(
    async (ybnftId, token, amount) => {
      const txHash = await withdrawFromYBNFT(investorContract, account, ybnftId, token, amount)

      console.info(txHash)
    },
    [account, investorContract],
  )

  return { onYBNFTDeposit: handleDeposit, onYBNFTWithdraw: handleWithdraw }
}
