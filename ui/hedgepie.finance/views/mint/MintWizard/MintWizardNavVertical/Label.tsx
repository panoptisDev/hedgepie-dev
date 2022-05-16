import React from 'react'
import { Box, ThemeUICSSObject } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import { styles } from 'views/mint/styles'

type Props = {
  index: number
  label: string
  active?: boolean
}

const Label = ({ index, label, active }: Props) => {
  const { wizard, setWizard } = React.useContext(MintWizardContext)

  const handleNavigate = () => {
    if (wizard.order !== index) {
      setWizard({
        ...wizard,
        order: index,
      })
    }
  }

  return (
    <Box>
      {index > 0 && <Box sx={styles.mint_nav_vertical_line as ThemeUICSSObject} />}
      <Box sx={styles.mint_nav_vertical_item_container as ThemeUICSSObject}>
        <Box
          className="wizard-nav-item"
          sx={{ ...styles.mint_nav_vertical_item, color: active ? '#000' : '#CCC' } as ThemeUICSSObject}
          onClick={handleNavigate}
        >
          {index + 1}
        </Box>
        <Box sx={styles.mint_nav_vertical_label as ThemeUICSSObject}>{label}</Box>
      </Box>
    </Box>
  )
}

export default Label
