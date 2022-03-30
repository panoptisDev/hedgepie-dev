import React from 'react'
import { Button, Box } from 'theme-ui'
import { ArrowRight } from 'react-feather'
import { useWeb3React } from '@web3-react/core'
import useWalletModal from 'widgets/WalletModal/useWalletModal'
import useAuth from 'hooks/useAuth'

const ConnectWallet = (props) => {
  const { isHeaderBtn } = props
  const { login, logout } = useAuth()
  const { account } = useWeb3React()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  const accountEllipsis = account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : null

  return (
    <>
      {isHeaderBtn ? (
        <Button
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            cursor: 'pointer',
            color: '#1799DE',
            height: '100%',
            background: 'transparent',
            '&:hover': {
              background: 'transparent',
            },
          }}
          onClick={() => {
            if (account) return
            onPresentConnectModal()
          }}
          {...props}
        >
          {account ? (
            <>{accountEllipsis}</>
          ) : (
            <>
              <Box
                sx={{
                  marginRight: '9px',
                }}
              >
                {'Connect Wallet'}
              </Box>
              <ArrowRight />
            </>
          )}
        </Button>
      ) : (
        <Button
          sx={{ background: '#1799DE', borderRadius: '50px', padding: '0px 48.5px', cursor: 'pointer' }}
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
