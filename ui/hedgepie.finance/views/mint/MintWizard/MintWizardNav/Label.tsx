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
    <Box sx={styles.mint_nav_horizontal_container as ThemeUICSSObject}>
      {index > 0 && <Box sx={styles.mint_nav_horizontal_line as ThemeUICSSObject} />}
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <Box
          className="wizard-nav-item"
          sx={{ ...styles.mint_nav_horizontal_item, color: active ? '#000' : '#CCC' } as ThemeUICSSObject}
          onClick={handleNavigate}
        >
          {index + 1}
        </Box>
        <Box sx={{ ...styles.mint_nav_horizontal_label, color: active ? '#000' : '#ccc' } as ThemeUICSSObject}>
          {label}
        </Box>
      </Box>
    </Box>
  )
}

export default Label
