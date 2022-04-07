import React from 'react'
import { ThemeProvider, Box, Text } from 'theme-ui'
import { theme } from 'themes/theme'

type Props = { label: string; value?: string }

const HPInfo = (props: Props) => {
  const { label, value } = props
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
          height: '56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 27px',
        }}
      >
        <Text
          sx={{
            fontStyle: 'normal',
            fontWeight: '600',
            fontSize: '16px',
            lineHeight: '28px',
            color: '#16103A',
          }}
        >
          {label}
        </Text>

        <Text
          sx={{
            fontFamily: 'Noto Sans',
            fontStyle: 'normal',
            fontWeight: '600',
            fontSize: '16px',
            lineHeight: '28px',
            color: '#8E8DA0',
          }}
        >
          {value}
        </Text>
      </Box>
    </ThemeProvider>
  )
}

export default HPInfo
