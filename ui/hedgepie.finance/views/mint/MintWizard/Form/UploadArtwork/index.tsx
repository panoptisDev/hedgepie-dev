import React, { useEffect, useState } from 'react'
import { Box, Input } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'

const UploadArtwork = () => {
  const { formData, setFormData } = React.useContext(MintWizardContext)
  const [file, setFile] = useState()

  useEffect(() => {
    if (file == null) return
    let reader = new FileReader()
    reader.onload = function (e: any) {
      setFormData({
        ...formData,
        artWorkFile: file,
        artWorkUrl: e.target.result,
      })
    }
    reader.readAsDataURL(file as unknown as Blob)
  }, [file])

  const handleChange = (e) => {
    if (e?.target?.files?.length > 0) {
      setFile(e?.target?.files[0])
    }
  }

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: 8,
        [`@media screen and (min-width: 500px)`]: {
          padding: 24,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
        <Box
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: '#14114B',
            [`@media screen and (min-width: 500px)`]: {
              fontSize: 24,
            },
          }}
        >
          Upload Artwork
        </Box>
        <Box
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: '#14114B',
            [`@media screen and (min-width: 500px)`]: {
              fontSize: 18,
            },
          }}
        >
          (Optional)
        </Box>
      </Box>
      <Box
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color: '#3B3969',
          [`@media screen and (min-width: 500px)`]: {
            fontSize: 16,
          },
        }}
      >
        Associate an illustration or file?
      </Box>

      <Box mt={24}>
        <Box as="label">
          <Input
            type="file"
            className="artwork-file-input"
            sx={{
              width: 0,
              height: 0,
              padding: 0,
              opacity: 0,
            }}
            onChange={handleChange}
          />
          <Box
            as="span"
            sx={{
              maxWidth: 270,
              width: '100%',
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)',
              color: '#fff',
              borderRadius: 8,
              transition: 'all .2s',
              cursor: 'pointer',
            }}
          >
            UPLOAD
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default UploadArtwork
