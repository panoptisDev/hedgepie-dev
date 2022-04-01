import BigNumber from 'bignumber.js'
import erc20Abi from 'config/abi/Erc20.json'
import masterChefAbi from 'config/abi/HedgepieMasterChef.json'
import multicall from 'utils/multicall'
import { getHpieAddress, getMasterChefAddress } from 'utils/addressHelpers'
import { Pool } from '../types'


export const fetchVaultUserData = async (account) => {
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
  const data = [] as any[];

  for (let pid = 0; pid < poolLength; pid++) {
    const [userVaultInfo, userPendingReward, poolInfo] = await multicall(
      masterChefAbi,
      [
        {
          address: getMasterChefAddress(),
          name: 'userInfo',
          params: [pid, account],

        },
        {
          address: getMasterChefAddress(),
          name: 'pendingReward',
          params: [pid, account],

        },
        {
          address: getMasterChefAddress(),
          name: 'poolInfo',
          params: [pid],

        },
      ],
    )

    const [userTokenAllowance, userTokenBalance] = await multicall(
      erc20Abi,
      [
        {
          address: poolInfo.lpToken,
          name: 'allowance',
          params: [account, getMasterChefAddress()]
        },
        {
          address: poolInfo.lpToken,
          name: 'balanceOf',
          params: [account],
        },
      ],
    )

    data.push({
      pid,
      allowance: new BigNumber(userTokenAllowance).div(new BigNumber(10).pow(18)).toNumber(),
      stakingTokenBalance: new BigNumber(userTokenBalance).div(new BigNumber(10).pow(18)).toNumber(),
      stakedBalance: new BigNumber(userVaultInfo.amount._hex).div(new BigNumber(10).pow(18)).toNumber(),
      pendingReward: new BigNumber(userPendingReward).div(new BigNumber(10).pow(18)).toNumber()
    })
  }
  return data;
}
