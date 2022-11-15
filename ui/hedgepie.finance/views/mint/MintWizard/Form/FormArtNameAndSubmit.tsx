import React from 'react'
import { Box, Button } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import UploadArtwork from './UploadArtwork'
import NftName from './NftName'
import YbNftSummaryArt from './YbNftSummaryArt'
import SubmitMint from './SubmitMint'

const FormArtNameAndSubmit = () => {
  const { formData } = React.useContext(MintWizardContext)
  const [summaryLegend, setSummaryLegend] = React.useState<any>([])

  React.useEffect(() => {
    const allocated = Math.min(100, formData.allocated)
    let legendData = [
      {
        title: 'Artwork',
        status: formData.artWorkUrl ? 'Set' : 'Not set',
      },
      {
        title: `${allocated}%`,
        status: 'Allocated',
      },
    ]
    if (allocated > 0 && allocated < 100) {
      legendData.push({
        title: `${100 - allocated}%`,
        status: 'Unallocated',
      })
    }
    setSummaryLegend(legendData)
  }, [formData.allocated])

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
        width: '100%',
      }}
    >
      <Box sx={{ width: '40rem' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            border: '2px solid #D9D9D9',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* <Box> */}
          <UploadArtwork />
          {/* </Box> */}
          {/* <Box mt={3}> */}
          <NftName />
          {/* </Box> */}
        </Box>
        <Box mt={24}>
          <SubmitMint />
        </Box>
      </Box>
      <Box
        sx={
          {
            // maxWidth: 334,
            // flexShrink: 0,
          }
        }
      >
        <YbNftSummaryArt />
      </Box>
    </Box>
  )
}

export default FormArtNameAndSubmit
