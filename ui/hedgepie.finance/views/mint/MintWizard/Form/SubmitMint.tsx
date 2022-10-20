import React, { useState } from 'react'
import { Box, Button, Spinner, Text } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import { useWeb3React } from '@web3-react/core'
import ipfs from 'utils/ipfs'
import toast from 'utils/toast'
import { useYBNFTMint } from 'hooks/useYBNFTMint'
import { useModal } from 'widgets/Modal'
import MintTransactionModal from './MintTransactionModal'
import { useAdapterManager } from 'hooks/useAdapterManager'
import { ArrowLeft } from 'react-feather'

const SubmitMint = () => {
  const { formData, strategies, wizard, setWizard } = React.useContext(MintWizardContext)
  const { account } = useWeb3React()
  const { onYBNFTMint } = useYBNFTMint()
  const [disabled, setDisabled] = useState(false)
  const [onMintTransactionModal] = useModal(<MintTransactionModal formData={formData} />, false)
  const { getTokenAddress } = useAdapterManager()

  const [promptMessage, setPromptMessage] = useState('')

  const validateMintEntries = () => {
    const duplicatesInPositions = (positions) => {
      let positionNames = [] as any[]
      let hasDuplicates = false
      positions.forEach((position) => {
        if (
          positionNames.filter(
            (p) =>
              JSON.stringify(p) === JSON.stringify({ protocol: position.composition.name, pool: position.pool.name }),
          ).length
        ) {
          console.log('here')
          hasDuplicates = true
        } else {
          positionNames.push({ protocol: position.composition.name, pool: position.pool.name })
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

      // Optional Image Upload
      // if (!formData.artWorkFile) {
      //   toast('Please upload an Image for the YBNFT', 'warning')
      //   isValid = false
      // }

      // Optional Description
      // if (!formData.description) {
      //   toast('Please provide a Description for the YBNFT', 'warning')
      //   isValid = false
      // }
      if (!formData.positions) {
        toast('Please add Positions for Minting the YBNFT', 'warning')
        isValid = false
      } else {
        if (!formData.positions.length) {
          toast('Please add Positions for Minting the YBNFT', 'warning')
          isValid = false
        } else {
          if (duplicatesInPositions(formData.positions)) {
            toast('Only one position of each Protocol/Pool combination allowed', 'warning')
            isValid = false
          } else if (ifTotalNotHundred(formData.positions)) {
            toast('Total Weight of strategies should be 100%', 'warning')
            isValid = false
          }
        }
      }
    }
    return isValid
  }

  const handleMint = async () => {
    // console.log(formData)
    setDisabled(true)
    setPromptMessage('Validating the Entries')
    if (!validateMintEntries()) {
      setPromptMessage('')
      setDisabled(false)
      return
    }

    // setPromptMessage('Uploading Image and YBNFT Metadata to IPFS')
    // const ipfsUrl = await getIPFSUrlForMetadata()
    // console.log('IPFS URL : ' + ipfsUrl)
    // // Create the needed Format of Positions
    // console.log('formData' + JSON.stringify(formData))
    // setPromptMessage('Minting YBNFT on BSC ...')
    // await mintYBNFT(formData, ipfsUrl)

    // setPromptMessage('')
    // setDisabled(false)

    onMintTransactionModal()
    setPromptMessage('')
    setDisabled(false)
  }

  const handleBack = () => {
    setWizard({
      ...wizard,
      order: 2,
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
          background: 'linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)',
          borderRadius: 6,
          padding: 0,
          cursor: 'pointer',
          transition: 'all .2s',
          fontSize: '20px',
          fontWeight: '600',
        }}
        onClick={handleMint}
        disabled={disabled}
      >
        {promptMessage ? promptMessage : 'MINT'} {disabled ? <Spinner sx={{ height: '2rem' }} /> : ''}
      </Button>
      {/* <Text sx={{ fontSize: 18, color: '#8E8DA0' }}>{promptMessage}</Text> */}
    </Box>
  )
}

export default SubmitMint
