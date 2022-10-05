import React from 'react'
import { Box, Button } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import PerformanceFee from './PerformanceFee'
import YbNftSummaryChart from './YbNftSummaryChart'
import toast from 'utils/toast'
import { ArrowLeft } from 'react-feather'

const FormPerformanceFee = () => {
  const { wizard, setWizard, account, formData } = React.useContext(MintWizardContext)

  const handleNext = () => {
    if (!account) {
      toast('Please connect your wallet to continue !!')
      return
    }
    if (formData.performanceFee > 9) {
      toast('Performance fee should be less than 10%', 'warning')
      return
    }

    setWizard({
      ...wizard,
      order: 3,
    })
  }

  const handleBack = () => {
    setWizard({
      ...wizard,
      order: 1,
    })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '34px',
        marginTop: 40,
        [`@media screen and (min-width: 1200px)`]: {
          flexDirection: 'row',
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <PerformanceFee />
        <Box mt={24} sx={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
          <Button
            variant="primary"
            sx={{
              height: 64,
              border: '1px solid #BAB9C5',
              borderRadius: 6,
              padding: 0,
              cursor: 'pointer',
              transition: 'all .2s',
              fontSize: '20px',
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              fontWeight: '600',
            }}
            onClick={handleBack}
          >
            <ArrowLeft />
            Back
          </Button>
          <Button
            variant="primary"
            sx={{
              height: 64,
              width: '100%',
              borderRadius: 6,
              padding: 0,
              cursor: 'pointer',
              transition: 'all .2s',
              fontSize: '20px',
              background: 'linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)',
            }}
            onClick={handleNext}
          >
            Next Step
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          maxWidth: 334,
          flexShrink: 0,
        }}
      >
        <YbNftSummaryChart />
      </Box>
    </Box>
  )
}

export default FormPerformanceFee
