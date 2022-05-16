import React from 'react'
import { Box, Image, ThemeUICSSObject } from 'theme-ui'
import MintWizard from './MintWizard'
import { styles } from './styles'

const Mint = () => {
  return (
    <Box sx={styles.mint_page_container as ThemeUICSSObject}>
      <Box sx={styles.mint_title_mast_container as ThemeUICSSObject}>
        <Box sx={styles.mint_title_mast_image_container as ThemeUICSSObject}>
          <Image src="/images/hedgehog-head.png" sx={styles.mint_title_mast_hedgehog_img as ThemeUICSSObject} />
        </Box>
      </Box>
      <Box sx={styles.mint_wizard_outer_container as ThemeUICSSObject}>
        <Box sx={styles.mint_wizard_inner_container as ThemeUICSSObject}>
          <MintWizard />
        </Box>
      </Box>
      <Box sx={styles.mint_eaten_pie_img_outer_container as ThemeUICSSObject}>
        <Box sx={styles.mint_eaten_pie_img_inner_container as ThemeUICSSObject}>
          <Image src="/images/pie-eaten.png" sx={styles.mint_eaten_pie_img as ThemeUICSSObject} />
        </Box>
      </Box>
    </Box>
  )
}

export default Mint
