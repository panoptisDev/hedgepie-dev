import React, { useEffect, useState } from 'react'
import { Button, Box, ThemeUICSSObject } from 'theme-ui'
import { ArrowRight } from 'react-feather'
import { useWeb3React } from '@web3-react/core'
import useWalletModal from 'widgets/WalletModal/useWalletModal'
import useAuth from 'hooks/useAuth'

import { styles } from './styles'

const ConnectWallet = (props) => {
  const { isHeaderBtn } = props
  const { login, logout } = useAuth()
  const { account, chainId } = useWeb3React()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  const accountEllipsis = account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : null
  const [chainImg, setChainImg] = useState('')

  useEffect(() => {
    switch (chainId) {
      case 1:
        setChainImg('/images/ethlogo.png')
        break
      case 137:
        console.log('polypoly')
        setChainImg('/images/polygonlogo.png')
        break
      case 56:
        setChainImg('/images/binancelogo.png')
        break
      default:
        break
    }
  }, [chainId])

  return (
    <>
      {isHeaderBtn ? (
        <Button
          sx={styles.header_connect_wallet_btn as ThemeUICSSObject}
          onClick={() => {
            if (account) return
            onPresentConnectModal()
          }}
          {...props}
        >
          {account ? (
            <>
              {accountEllipsis}{' '}
              <img src={chainImg} alt="chain-image" width="40px" height="40px" style={{ marginLeft: '10px' }} />
            </>
          ) : (
            <>
              <Box
                sx={{
                  marginRight: '9px',
                }}
              >
                {'Connect Wallet'}
              </Box>
              {/* <ArrowRight /> */}
            </>
          )}
        </Button>
      ) : (
        <Button
          sx={styles.non_header_connect_wallet_btn as ThemeUICSSObject}
          onClick={onPresentConnectModal}
          {...props}
        >
          {'Connect Wallet'}
        </Button>
      )}
    </>
  )
}

export { ConnectWallet }
