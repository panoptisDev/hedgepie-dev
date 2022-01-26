/** @jsxImportSource theme-ui */
/** @jsx jsx */
/** @jsxRuntime classic */

import { useState, useEffect } from "react"
import { ThemeProvider, Spinner, Text, Button, Flex, jsx } from "theme-ui"
import { ethers } from "ethers"

import { theme } from "../../themes/theme"
import * as commonConstants from "../../constants/common"

import themeStyles from "./themeStyles"
import styles from "./HomePage.module.css"

type Props = {}

const HomePage = (props: Props) => {
  const daiAddress = "dai.tokens.ethers.eth"

  const daiAbi = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",

    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ]

  const [provider, setProvider] = useState<any | undefined>()
  const [signer, setSigner] = useState<any | undefined>()
  const [daiContract, setDaiContract] = useState<any | undefined>()
  const [blockNumber, setBlockNumber] = useState(0)
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")

  const [nameLoading, setNameLoading] = useState(commonConstants.UNLOADED)
  const [symbolLoading, setSymbolLoading] = useState(commonConstants.UNLOADED)

  useEffect(() => {
    setProvider(new ethers.providers.Web3Provider(window.ethereum))
  }, [])

  useEffect(() => {
    if (provider?.getSigner) {
      setSigner(provider.getSigner())
    }
  }, [provider])

  useEffect(() => {
    console.log("Signer: " + signer)
  }, [signer])

  useEffect(() => {
    provider && setDaiContract(new ethers.Contract(daiAddress, daiAbi, provider))
  }, [provider])

  /* Functions */

  // Get Block from Ethereum
  const getBlock = async () => {
    setBlockNumber(await provider.getBlockNumber())
  }

  // Interact with a sample contract (DAI)
  const getName = async () => {
    if (daiContract) {
      setNameLoading(commonConstants.LOADING)
      setName(await daiContract.name())
      setNameLoading(commonConstants.LOADED)
    }
  }

  const getSymbol = async () => {
    if (daiContract) {
      setSymbolLoading(commonConstants.LOADING)
      setSymbol(await daiContract.symbol())
      setSymbolLoading(commonConstants.LOADED)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Flex className={styles.container}>
        <Text as="h1" sx={themeStyles.h1}>
          Checking Theme UI Working
        </Text>
        <Text as="h2" sx={themeStyles.h2}>
          Welcome to Hedgepie.finance !!
        </Text>
        <Text as="h1" sx={themeStyles.h1}>
          Checking Ethers JS Working
        </Text>
        <Button onClick={getBlock}>Get Block Number</Button>
        <Text sx={themeStyles.details}>{blockNumber}</Text>
        {/* For Contract Name */}
        <Button onClick={getName}>Get Contract Name</Button>
        {nameLoading === commonConstants.LOADING ? (
          <Spinner />
        ) : (
          <Text sx={themeStyles.details}>{name}</Text>
        )}
        {/* For Contract Symbol */}
        <Button onClick={getSymbol}>Get Contract Symbol</Button>
        {symbolLoading === commonConstants.LOADING ? (
          <Spinner />
        ) : (
          <Text sx={themeStyles.details}>{symbol}</Text>
        )}
      </Flex>
    </ThemeProvider>
  )
}

export default HomePage
