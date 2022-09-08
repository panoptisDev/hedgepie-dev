import React, { useEffect, useState } from 'react'
import MintWizardContext from 'contexts/MintWizardContext'
import { useAdapterManager } from 'hooks/useAdapterManager'
import { getPrice } from 'utils/getTokenPrice'
import { useWeb3React } from '@web3-react/core'

interface AdapterOption {
  icon?: string
  name?: string
  type?: string
  address?: string
}

const MintContextProvider = ({ children }) => {
  const { getAdapters } = useAdapterManager()
  const [wizard, setWizard] = React.useState({
    forms: ['Initial Stake Amount', 'Choose positions & Widgets', 'Set Performance fee', 'Optional Art & Name'],
    order: 0,
  })
  const { account, chainId } = useWeb3React()
  const [formData, setFormData] = React.useState({
    positions: [],
    performanceFee: 5,
    artWorkFile: null,
    artWorkUrl: '',
    nftName: '',
    allocated: 0,
    initialStake: 0,
  })
  const [strategies, setStrategies] = useState<any>([])
  // We will be having the prices of all the tokens as we can use them as needed, for all adapter price calculations.
  const [bnbPrice, setBNBPrice] = useState(0)
  const [ethPrice, setEthPrice] = useState(0)
  const [maticPrice, setMaticPrice] = useState(0)

  const getIcon = (protocol) => {
    let protoStr = protocol.toLowerCase()
    if (protoStr.includes('apeswap')) return 'images/apeswap.png'
    else if (protoStr.includes('autofarm')) return 'images/autofarm.png'
    else if (protoStr.includes('biswap')) return 'images/biswap.png'
    else if (protoStr.includes('beefy')) return 'images/beefy.png'
    else if (protoStr.includes('belt')) return 'images/belt.png'
    else if (protoStr.includes('venus')) return 'images/venus.png'
  }

  useEffect(() => {
    const getCompositionOptions = async () => {
      try {
        const adapters = await getAdapters()
        console.log('adapters' + JSON.stringify(adapters))
        var adapterOptions = {}
        adapters.forEach((adapter) => {
          console.log(adapter)
          if (adapter.name.includes('::')) {
            let split = adapter.name.split('::')
            let protocol = split[0]
            let pool = split[split.length - 1]
            !adapterOptions[protocol] ? (adapterOptions[protocol] = {}) : ''
            !adapterOptions[protocol]['icon'] ? (adapterOptions[protocol]['icon'] = getIcon(protocol)) : ''
            adapterOptions[protocol][pool] = { addr: adapter.addr, token: adapter.stakingToken }
          }
        })
        console.log('options' + JSON.stringify(adapterOptions))
        setStrategies(adapterOptions)
      } catch (err) {
        console.log('err' + JSON.stringify(err))
      }
    }

    getCompositionOptions()
  }, [])

  useEffect(() => {
    const fetchTokenPrice = async () => {
      setBNBPrice((await getPrice('BNB')) as number)
      setEthPrice((await getPrice('ETH')) as number)
      setMaticPrice((await getPrice('MATIC')) as number)
    }
    fetchTokenPrice()
  }, [])

  const value = React.useMemo(
    () => ({
      wizard,
      formData,
      strategies,
      setWizard,
      ethPrice,
      setFormData,
      bnbPrice,
      maticPrice,
      account,
      chainId,
    }),
    [wizard, formData, strategies, bnbPrice, account, chainId],
  )

  return <MintWizardContext.Provider value={value}>{children}</MintWizardContext.Provider>
}

export default MintContextProvider
