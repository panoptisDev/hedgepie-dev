import React, { useEffect } from 'react'
import { ThemeProvider, Box, Input, Button, Badge, Flex } from 'theme-ui'
import { theme } from 'themes/theme'
import { useWeb3React } from '@web3-react/core'
import { ConnectWallet } from 'components/ConnectWallet'

type Props = { placeholder?: string }

const HPButtonInput = (props: Props) => {
  const { placeholder } = props
  const { account } = useWeb3React()

  useEffect(() => {}, [])

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          marginBottom: '10px',
          backgroundColor: '#fff',
          borderRadius: '31px',
        }}
      >
        <Flex sx={{ position: 'absolute', marginTop: 0, height: '100%', gap: '10px', zIndex: '1' }}>
          {account ? (
            <Button
              {...props}
              sx={{
                background: '#1799DE',
                borderRadius: '50px',
                padding: '0px 48.5px',
                cursor: 'pointer',
                '&:disabled': {
                  // background: '#ffff00',
                },
              }}
              onClick={() => {
                alert('stake')
              }}
            >
              Stake
            </Button>
          ) : (
            <ConnectWallet />
          )}
          <Badge
            sx={{
              width: 'fit-content',
              height: 'fit-content',
              alignSelf: 'center',
              backgroundColor: 'rgba(160, 160, 160, 0.32)',
              borderRadius: '4px',
              color: '#8E8DA0',
              fontWeight: '300',
            }}
          >
            MAX
          </Badge>
        </Flex>
        <Input
          sx={{
            position: 'relative',
            height: '56px',
            borderRadius: '30px',
            minWidth: '30rem',
            boxShadow: 'none',
            border: 'none',
            outline: 0,
            fontSize: '16px',
            paddingRight: '1rem',
            textAlign: 'right',
            fontWeight: '600',
            color: '#8E8DA0',
          }}
          maxLength={6}
          placeholder={placeholder}
        />
      </Box>
    </ThemeProvider>
  )
}

export default HPButtonInput
