import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ThemeProvider, jsx, Box, Flex, Button, Text, Image, Input, Select, ThemeUICSSObject } from 'theme-ui'
import { theme } from 'themes/theme'
import { ConnectWallet } from 'components/ConnectWallet'

import { styles } from '../../components/Mint/styles'
import Steps from 'components/Mint/Steps'
import Positions from 'components/Mint/Positions'
import PerformanceFee from 'components/Mint/PerformanceFee'
import ArtworkNFTTitle from 'components/Mint/ArtworkNFTTitle'
import Summary from 'components/Mint/Summary'

type Props = {}

type Position = {
  posType: string
  posQuantity: number
  posWeight: number
}

const Mint = (props: Props) => {
  const [step, setStep] = useState(1)
  const [positions, setPositions] = useState([] as Position[])
  const [allocated, setAllocated] = useState(0)
  const [performanceFee, setPerformanceFee] = useState(0)
  const [YBNFTName, setYBNFTName] = useState('')
  const [chosenFileName, setChosenFileName] = useState('')
  const [chosenFile, setChosenFile] = useState<any | undefined>()

  // Perform any operations for the state update of positions
  useEffect(() => {
    var totalAllocated = 0
    positions.forEach((position) => {
      totalAllocated = (totalAllocated + position.posWeight) as number
    })
    setAllocated(totalAllocated)
  }, [positions])

  const uploadFile = () => {
    //TODO:
    // Perform the functions to upload the artwork
  }

  const mintYBNFT = () => {
    // React State Data
    console.log('YB NFT NAME: ' + YBNFTName)
    console.log('YB NFT Artwork: ' + chosenFileName)
    console.log('Performance Fee: ' + performanceFee)
    console.log('Positions: ' + JSON.stringify(positions))

    // Mapping to suitable contract data
    var swapPercent: number[] = []
    var swapToken: number[] = []
    var strategyAddress: string[] = []

    positions.forEach((position) => {
      strategyAddress.push(position.posType)
      swapToken.push(position.posQuantity)
      swapPercent.push(position.posWeight)
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={3}>
        <Flex sx={styles.outer_container as ThemeUICSSObject}>
          <Flex sx={styles.inner_container as ThemeUICSSObject}>
            {/* Banner */}
            <Flex sx={styles.banner_text as ThemeUICSSObject}>
              YB NFT Minting
              {/* <ConnectWallet>
                <Button sx={styles.connect_wallet_button as ThemeUICSSObject}>Connect Wallet</Button>
              </ConnectWallet> */}
            </Flex>
            {/* Steps */}
            <Steps step={step} setStep={setStep} />

            {/* Full Content (with the right and left parts) */}
            <Flex sx={styles.content_container as ThemeUICSSObject}>
              {/* Left Content */}
              <Flex sx={styles.left_content_container as ThemeUICSSObject}>
                {step === 1 && <Positions positions={positions} setPositions={setPositions} />}
                {step === 2 && <PerformanceFee setPerformanceFee={setPerformanceFee} />}
                {step === 3 && (
                  <ArtworkNFTTitle
                    setChosenFile={setChosenFile}
                    setChosenFileName={setChosenFileName}
                    uploadFile={uploadFile}
                    setYBNFTName={setYBNFTName}
                  />
                )}
                {step != 3 && (
                  <Button
                    sx={styles.next_step_button as ThemeUICSSObject}
                    onClick={() => {
                      if (step != 3) setStep(step + 1)
                    }}
                  >
                    NEXT STEP
                  </Button>
                )}
                {step === 3 && (
                  <Button sx={styles.next_step_button as ThemeUICSSObject} onClick={mintYBNFT}>
                    MINT YB NFT
                  </Button>
                )}
              </Flex>
              {/* Right Content */}
              <Summary chosenFileName={chosenFileName} allocated={allocated} YBNFTName={YBNFTName} />
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default Mint
