import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useDispatch } from 'react-redux'
import { useMasterchef } from 'hooks/useContract'
import { fetchVaultUserDataAsync } from 'state/actions'
import { stakeOnMasterChef, unstakeOnMasterChef } from 'utils/callHelpers'

export const useMasterChef = () => {
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  const masterChefContract = useMasterchef()

  const handleStake = useCallback(async (pid, amount) => {
    const txHash = await stakeOnMasterChef(masterChefContract, pid, amount, account)
    dispatch(fetchVaultUserDataAsync(account))
    console.info(txHash)
  }, [account, dispatch, masterChefContract])

  const handleUnStake = useCallback(async (pid, amount) => {
    const txHash = await unstakeOnMasterChef(masterChefContract, pid, amount, account)
    dispatch(fetchVaultUserDataAsync(account))
    console.info(txHash)
  }, [account, dispatch, masterChefContract])

  const handleClaim = useCallback(async (pid) => {
    const txHash = await unstakeOnMasterChef(masterChefContract, pid, 0, account)
    dispatch(fetchVaultUserDataAsync(account))
    console.info(txHash)
  }, [account, dispatch, masterChefContract])

  return { onStake: handleStake, onUnstake: handleUnStake, onClaim: handleClaim }
}
