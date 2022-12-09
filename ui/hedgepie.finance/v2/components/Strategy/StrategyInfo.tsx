import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Box, Button, Text } from 'theme-ui'
import StrategyCharts from './StrategyCharts'
import StrategyComposition from './StrategyComposition'
import StrategyOverview from './StrategyOverview'
import queryString from 'query-string'
import useAuth from 'hooks/useAuth'
import { useWeb3React } from '@web3-react/core'
import { connectorLocalStorageKey, ConnectorNames, useWalletModal } from 'widgets/WalletModal'
import RiskInformation from './RiskInformation'

function StrategyInfo() {
  const router = useRouter()
  const [tokenId, setTokenId] = useState<any>()

  useEffect(() => {
    const res = queryString.parse(router.asPath.split(/\?/)[1])
    res.tokenId ? setTokenId(Number(res.tokenId)) : router.push('/nft-leaderboard')
  }, [])

  const { login, logout } = useAuth()
  const { account, chainId } = useWeb3React()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  useEffect(() => {
    console.log('process' + JSON.stringify(process.env))
    let key = window.localStorage.getItem(connectorLocalStorageKey) as ConnectorNames
    console.log('keyy+' + key)
    if (key) {
      login(key)
    }
  }, [])

  return (
    <>
      {account ? (
        <Box
          sx={{
            margin: ['0.5rem 1rem', '2rem 3rem', '2rem 3rem', '2rem 3rem'],
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {tokenId && (
            <>
              <StrategyOverview tokenId={tokenId} />
              <StrategyComposition tokenId={tokenId} />
              {process.env.NEXT_PUBLIC_RISK_INFO_ENABLED === 'true' ? <RiskInformation tokenId={tokenId} /> : null}
              <StrategyCharts tokenId={tokenId} />
            </>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            height: '20rem',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <Text sx={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px', color: '#14114B', fontWeight: '600' }}>
            Please connect wallet to access information regarding your strategy 🎉
          </Text>
          <Button
            sx={{
              padding: '10px',
              fontSize: '20px',
              fontFamily: 'Plus Jakarta Sans',
              background: 'linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)',
              cursor: 'pointer',
            }}
            onClick={onPresentConnectModal}
          >
            Connect Wallet
          </Button>
        </Box>
      )}
    </>
  )
}

export default StrategyInfo
