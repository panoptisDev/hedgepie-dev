import React from 'react'
import { ThemeProvider, jsx, Flex, Text, Switch } from 'theme-ui'
import { theme } from 'themes/theme'

type Props = {
  value: string
  onSwitch: () => void
}

const HPSwitch = (props: Props) => {
  const { value, onSwitch } = props

  return (
    <ThemeProvider theme={theme}>
      <Flex
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          marginBottom: '1rem',
          marginLeft: '3rem',
        }}
      >
        <Text
          sx={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#16103A',
            opacity: '0.8',
          }}
        >
          DEPOSIT
        </Text>
        <Flex sx={{ padding: '0rem 2rem 0rem 2rem' }}>
          <Switch
            css={{
              backgroundColor: 'rgba(200,179,207,1)',
            }}
            sx={{
              backgroundColor: 'gray',
              'input:checked ~ &': {
                backgroundColor: 'rgba(0,212,255,1)',
              },
            }}
            value={value}
            onClick={onSwitch}
          />
        </Flex>
        <Text
          css={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#16103A',
            opacity: '0.8',
          }}
        >
          WITHDRAW
        </Text>
      </Flex>
    </ThemeProvider>
  )
}

export default HPSwitch
