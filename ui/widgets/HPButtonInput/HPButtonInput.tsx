/** @jsx jsx */
/** @jsxRuntime classic */

import { useEffect } from 'react'
import { ThemeProvider, jsx, Box, Input, Button, Badge, Flex } from 'theme-ui'
import { theme } from 'themes/theme'
import { ConnectWallet } from 'components/ConnectWallet'

type Props = { placeholder?: string }

const HPButtonInput = (props: Props) => {
  useEffect(() => {}, [])
  const { placeholder } = props
  return (
    <ThemeProvider theme={theme}>
      <Box
        css={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          marginBottom: '10px',
          backgroundColor: '#fff',
          borderRadius: '31px',
        }}
      >
        <Flex css={{ position: 'absolute', marginTop: 0, height: '100%', gap: '10px', zIndex: '1' }}>
          <ConnectWallet />
          <Badge
            css={{
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
          css={{
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
