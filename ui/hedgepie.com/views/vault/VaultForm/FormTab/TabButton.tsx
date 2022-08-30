import { Box, ThemeUICSSObject } from 'theme-ui'

import { styles } from '../styles'

const TabButton = ({ active = false, label, ...props }) => {
  // WITHDRAW

  return (
    <Box
      sx={
        {
          backgroundColor: active ? '#16103A' : 'transparent',
          color: active ? '#fff' : '#fff8',
          cursor: active ? 'default' : 'pointer',
          '&:hover': {
            color: '#fff',
          },
          '&:active': {
            color: active ? '#fff' : '#fffc',
          },
          ...styles.vault_form_tab,
        } as ThemeUICSSObject
      }
      {...props}
    >
      {label}
    </Box>
  )
}

export default TabButton
