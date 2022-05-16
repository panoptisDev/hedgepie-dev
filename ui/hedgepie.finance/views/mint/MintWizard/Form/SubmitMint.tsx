import React from 'react'
import { Button } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import { useWeb3React } from '@web3-react/core'
import ipfs from 'utils/ipfs'
import toast from 'utils/toast'

const SubmitMint = () => {
  const { formData } = React.useContext(MintWizardContext)
  const { account } = useWeb3React()

  const validateMintEntries = () => {
    console.log(formData + ' ' + account)

    if (!account) {
      toast('Please connect your wallet to mint a YB NFT', 'warning')
      return
    }

    let isValid = true
    if (formData) {
      if (formData.nftName === '') {
        toast('NFT Name cannot be empty', 'warning')
        isValid = false
      }
      if (!formData.artWorkFile) {
        toast('Please upload an Image for the YBNFT', 'warning')
        isValid = false
      }
      if (!formData.description) {
        toast('Please provide a Description for the YBNFT', 'warning')
        isValid = false
      }
    }
    return isValid
  }

  const getIPFSUrlForMetadata = async () => {
    const imgCID = await ipfs.uploadImageToIPFS(formData.artWorkFile, account + '_' + formData.nftName)
    const nftMetadata = {
      account: account,
      name: formData.nftName,
      description: formData.description,
      imageURL: 'https://' + imgCID + '.ipfs.dweb.link',
    }
    const metadataCID = await ipfs.uploadMetadataToIPFS(nftMetadata, account + '_' + formData.nftName)

    console.log('IMAGE IPFS LINK: ' + 'https://' + imgCID + '.ipfs.dweb.link')
    console.log('METADATA IPFS LINK: ' + 'https://' + metadataCID + '.ipfs.dweb.link')

    toast('IMAGE CID : ' + imgCID)
    toast('METADATA CID : ' + metadataCID)

    return metadataCID
  }

  const handleMint = async () => {
    if (!validateMintEntries()) {
      return
    }

    const ipfsUrl = await getIPFSUrlForMetadata()

    console.log('IPFS URL : ' + ipfsUrl)

    //TODO : Set the metadata CID with the contract and minted nft address and store
  }

  return (
    <Button
      variant="primary"
      sx={{
        height: 64,
        width: '100%',
        border: '1px solid #1799DE',
        borderRadius: 40,
        padding: 0,
        cursor: 'pointer',
        transition: 'all .2s',
      }}
      onClick={handleMint}
    >
      MINT YB NFT
    </Button>
  )
}

export default SubmitMint
