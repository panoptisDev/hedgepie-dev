import React from 'react'
import { Box, Input } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'

const NftName = () => {
  const { formData, setFormData } = React.useContext(MintWizardContext)

  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      nftName: e.target.value,
    })
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
      <Box
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: '#1380B9',
          [`@media screen and (min-width: 500px)`]: {
            fontSize: 24,
          },
        }}
      >
        Fund Name
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
        Provide a name you want to give your YB-NFT
      </Box>
      <Box mt={24}>
        <Input
          type="text"
          className="nft-name-input"
          sx={{
            height: 62,
            width: '50%',
            backgroundColor: '#F3F3F3',
            border: '1.5px solid #E3E3E3',
            borderRadius: 8,
            fontSize: 24,
            paddingLeft: 24,
            paddingRight: 24,
            outline: 'none',
          }}
          // placeholder="NFT Title ..."
          value={formData.nftName}
          onChange={handleNameChange}
          placeholder="Name this YB-NFT"
        />
      </Box>
    </Box>
  )
}

export default NftName
