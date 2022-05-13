import React from 'react'
import { Box, ThemeUICSSObject } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import MintWizardNav from './MintWizardNav'
import MintWizardNavVertical from './MintWizardNavVertical'
import FormPosition from './Form/FormPosition'
import FormPerformanceFee from './Form/FormPerformanceFee'
import FormArtName from './Form/FormArtName'
import { styles } from '../styles'

const MintWizard = () => {
  const { wizard } = React.useContext(MintWizardContext)

  return (
    <Box sx={styles.mint_flow_outer_container as ThemeUICSSObject}>
      <Box sx={styles.ybnft_mint_title_box as ThemeUICSSObject}>YB NFT Minting</Box>
      <Box sx={styles.mint_wizard_nav_container as ThemeUICSSObject}>
        <MintWizardNav sx={styles.mint_wizard_horizontal_nav as ThemeUICSSObject} />
        <MintWizardNavVertical sx={styles.mint_wizard_vertical_nav as ThemeUICSSObject} />
        {wizard.order === 0 && <FormPosition />}
        {wizard.order === 1 && <FormPerformanceFee />}
        {wizard.order === 2 && <FormArtName />}
      </Box>
    </Box>
  )
}

export default MintWizard
