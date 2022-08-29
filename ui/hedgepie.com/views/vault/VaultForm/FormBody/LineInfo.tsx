import React from 'react'
import { Box, Text, ThemeUICSSObject } from 'theme-ui'
import { styles } from '../styles'

const HPInfo = ({ label, value, id }) => {
  return (
    <Box sx={styles.vault_line_info_container as ThemeUICSSObject} id={id}>
      <Text
        sx={{
          fontWeight: 700,
          color: '#16103A',
        }}
        id="lineinfo-label"
      >
        {label}
      </Text>
      <Text
        sx={{
          fontWeight: 700,
          color: '#8E8DA0',
        }}
        id="lineinfo-value"
      >
        {value}
      </Text>
    </Box>
  )
}

export default HPInfo
