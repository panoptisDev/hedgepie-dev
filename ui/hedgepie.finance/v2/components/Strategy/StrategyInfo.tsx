import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Box } from 'theme-ui'
import StrategyCharts from './StrategyCharts'
import StrategyComposition from './StrategyComposition'
import StrategyOverview from './StrategyOverview'
import queryString from 'query-string'
import useAuth from 'hooks/useAuth'
import { useWeb3React } from '@web3-react/core'
import { connectorLocalStorageKey, ConnectorNames, useWalletModal } from 'widgets/WalletModal'

function StrategyInfo() {
  const router = useRouter()
  const [tokenId, setTokenId] = useState<any>()

  useEffect(() => {
    console.log('hello' + JSON.stringify(router.query))
    const res = queryString.parse(router.asPath.split(/\?/)[1])
    res.tokenId ? setTokenId(Number(res.tokenId)) : router.push('/nft-leaderboard')
  }, [])

  const { login, logout } = useAuth()
  const { account, chainId } = useWeb3React()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  useEffect(() => {
    let key = window.localStorage.getItem(connectorLocalStorageKey) as ConnectorNames
    if (key) {
      onPresentConnectModal()
    }
  }, [])

  return (
    <Box sx={{ margin: '2rem 3rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {tokenId && (
        <>
          <StrategyOverview tokenId={tokenId} />
          <StrategyCharts tokenId={tokenId} />
          <StrategyComposition tokenId={tokenId} />
        </>
      )}
    </Box>
  )
}

export default StrategyInfo
