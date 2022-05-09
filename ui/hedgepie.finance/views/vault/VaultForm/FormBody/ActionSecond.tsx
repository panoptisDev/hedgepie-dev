import React from 'react'
import { Box, Button, ThemeUICSSObject } from 'theme-ui'
import { styles } from '../styles'

const HPAction = () => {
  return (
    <Box sx={styles.vault_second_action_container as ThemeUICSSObject}>
      <Button variant="primary" sx={styles.vault_second_action_button as ThemeUICSSObject} id="harvest-button">
        Harvest
      </Button>
      <Button variant="primary" sx={styles.vault_second_action_button as ThemeUICSSObject} id="compound-button">
        Compound
      </Button>
    </Box>
  )
}

export default HPAction
