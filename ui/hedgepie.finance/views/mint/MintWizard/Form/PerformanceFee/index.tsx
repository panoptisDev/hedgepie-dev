import React from 'react'
import { Box, Input } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'

const PerformanceFee = () => {
  const { formData, setFormData } = React.useContext(MintWizardContext)

  const handleChange = (e) => {
    let newValue = parseInt(e.target.value, 10) || 0
    if (newValue < 100) {
      setFormData({
        ...formData,
        performanceFee: newValue.toString(),
      })
    }
  }

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: '#E5F6FF',
        border: '2px solid #BAB9C5',
        background: '#FFFFFF',
        borderRadius: 8,
        [`@media screen and (min-width: 500px)`]: {
          padding: 24,
        },
      }}
    >
      <Box
        sx={{
          fontSize: 24,
          fontWeight: 700,
          color: '#1380B9',
          [`@media screen and (min-width: 500px)`]: {
            fontSize: 24,
          },
        }}
      >
        Performance Fee
      </Box>
      <Box
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: '#3B3969',
          [`@media screen and (min-width: 500px)`]: {
            fontSize: 16,
          },
        }}
      >
        Creator earnings
      </Box>
      <Box
        sx={{
          fontSize: 16,
          mt: 22,
          color: '#1A1A1A',
          [`@media screen and (min-width: 500px)`]: {
            fontSize: 16,
            fontWeight: '600',
          },
        }}
      >
        It is a long established fact that a reader will be distracted by the readable content of a page when looking at
        its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as
        opposed to using 'Content here, content here', making it look like readable English.
      </Box>
      <Box mt={36}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 120,
            height: 62,
            paddingLeft: 24,
            paddingRight: 24,
            color: '#0A3F5C',
            fontSize: 30,
            fontWeight: 700,
            backgroundColor: '#fff',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #E3E3E3',
            background: '#F3F3F3',
          }}
        >
          <Input
            className="performance-input"
            sx={{
              border: 'none',
              outline: 'none',
              padding: 0,
              textAlign: 'right',
              pr: 2,
            }}
            type="number"
            min={0}
            max={10}
            value={formData.performanceFee}
            onChange={handleChange}
            onWheel={(e) => e.currentTarget.blur()}
          />
          %
        </Box>
      </Box>
    </Box>
  )
}

export default PerformanceFee
