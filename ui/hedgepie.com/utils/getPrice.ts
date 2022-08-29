import { getHpieAddress, getHpieLpAddress } from 'utils/addressHelpers'
import { BLOCK_GENERATION_TIME, SECONDS_PERY_YEAR } from 'constants/common'

export const getTokenPrice = (address: string): number => {
  if (address.toLowerCase() === getHpieAddress().toLowerCase()) {
    return 15;
  }

  if (address.toLowerCase() === getHpieLpAddress().toLowerCase()) {
    return 30;
  }

  return 10;
}


export const getTvl = (tokenAddress?: string, totalLockedAmount?: number): number => {
  if (!tokenAddress || !totalLockedAmount) return 0;
  return getTokenPrice(tokenAddress) * totalLockedAmount
}

export const getApy = (rewardTokenAddress?: string, rewardPerBlock?: number, rewardAllocation?: number, tvl?: number): number => {
  if (!rewardTokenAddress || !rewardPerBlock || !rewardAllocation || !tvl) return 0;
  const blocksPerYear = SECONDS_PERY_YEAR / BLOCK_GENERATION_TIME
  const apy = getTokenPrice(rewardTokenAddress) * rewardPerBlock * blocksPerYear / tvl
  return apy > 999 ? 999 : apy;
}