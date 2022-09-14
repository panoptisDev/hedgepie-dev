import React from 'react'
import { Box } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import toast from 'utils/toast'

type Props = {
  index: number
  label: string
  active?: boolean
}

const Label = ({ index, label, active }: Props) => {
  const { wizard, setWizard, account, formData } = React.useContext(MintWizardContext)

  const duplicatesInPositions = (positions) => {
    let positionNames = [] as any[]
    let hasDuplicates = false
    positions.forEach((position) => {
      if (
        positionNames.filter(
          (p) =>
            JSON.stringify(p) === JSON.stringify({ protocol: position?.composition?.name, pool: position?.pool?.name }),
        ).length
      ) {
        hasDuplicates = true
      } else {
        positionNames.push({ protocol: position?.composition?.name, pool: position?.pool?.name })
      }
    })
    return hasDuplicates
  }

  const ifTotalNotHundred = (positions) => {
    let total = 0
    for (let position of positions) {
      total = total + parseFloat(position.weight)
    }
    if (total !== 100) {
      return true
    }
    return false
  }

  const handleNavigate = () => {
    if (!account) {
      toast('Please connect your wallet to continue !!')
      return
    }
    if (index === 2) {
      if (duplicatesInPositions(formData.positions) || ifTotalNotHundred(formData.positions)) {
        toast('Cannot proceed with duplicate positions or the total not being 100%', 'warning')
        return
      }
    }
    if (index === 3) {
      if (formData.performanceFee > 9) {
        toast('Performance Fee should be less than 10%', 'warning')
      }
    }
    if (wizard.order !== index && (index === wizard.order + 1 || index < wizard.order)) {
      setWizard({
        ...wizard,
        order: index,
      })
    }
    if (index > wizard.order + 1) {
      toast('Please make sure, you go in order, for minting a YBNFT')
      return
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginTop: 50,
      }}
    >
      {index > 0 && (
        <Box
          sx={{
            height: '3px',
            width: 160,
            backgroundColor: '#1799DE',
          }}
        />
      )}
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <Box
          className="wizard-nav-item"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 74,
            height: 74,
            border: '3px solid #1799DE',
            color: active ? '#1799DE' : index >= 0 && index < wizard.order ? '#fff' : '#CCC',
            borderRadius: '50%',
            fontSize: 36,
            fontWeight: 900,
            userSelect: 'none',
            cursor: 'pointer',
            transition: 'all .2s',
            // '&:hover': {
            //   backgroundColor: '#1799DE11',
            // },
            // '&:active': {
            //   backgroundColor: '#1799DE33',
            // },
            backgroundColor: index >= 0 && index < wizard.order ? '#1799DE' : '#fff',
          }}
          onClick={handleNavigate}
        >
          {index + 1}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            left: 30,
            display: 'flex',
            justifyContent: 'center',
            width: 0,
            whiteSpace: 'nowrap',
            color: active ? '#000' : '#ccc',
          }}
        >
          {label}
        </Box>
      </Box>
    </Box>
  )
}

export default Label
