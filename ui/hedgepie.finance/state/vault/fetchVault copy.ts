import BigNumber from 'bignumber.js'
import masterChefAbi from 'config/abi/HedgepieMasterChef.json'
import multicall from 'utils/multicall'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { Pool } from '../types'


export const fetchGlobalData = async () => {
  const [poolLength, rewardToken, rewardPerBlock, totalAllocPoint] = await multicall(
    masterChefAbi,
    [
      {
        address: getMasterChefAddress(),
        name: 'poolLength',
      },
      {
        address: getMasterChefAddress(),
        name: 'rewardToken',
      },
      {
        address: getMasterChefAddress(),
        name: 'rewardPerBlock',
      },
      {
        address: getMasterChefAddress(),
        name: 'totalAllocPoint',
      },
    ],
  )

  return {
    poolLength: new BigNumber(poolLength).toNumber(),
    rewardToken: rewardToken[0],
    rewardPerBlock: new BigNumber(rewardPerBlock).div(new BigNumber(10).pow(18)).toNumber(),
    totalAllocPoint: new BigNumber(totalAllocPoint).toNumber(),
  }
}

export const fetchVaultPoolData = async () => {
  const [_poolLength] = await multicall(
    masterChefAbi,
    [
      {
        address: getMasterChefAddress(),
        name: 'poolLength',
      }
    ],
  )

  const poolLength = new BigNumber(_poolLength).toNumber();
  const data = [] as Pool[];

  for (let pid = 0; pid < poolLength; pid++) {
    const [poolInfo] = await multicall(
      masterChefAbi,
      [
        {
          address: getMasterChefAddress(),
          name: 'poolInfo',
          params: [pid],

        },
      ],
    )

    data.push({
      pid,
      lpToken: poolInfo.lpToken,
      allocPoint: new BigNumber(poolInfo.allocPoint._hex).toNumber(),
      totalStaked: new BigNumber(poolInfo.totalShares._hex).div(new BigNumber(10).pow(18)).toNumber()
    })
  }

  return data;
}