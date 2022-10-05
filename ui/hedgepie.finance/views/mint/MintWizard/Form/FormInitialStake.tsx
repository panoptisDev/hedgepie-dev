import React, { useEffect, useState } from 'react'
import { Box, Button } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import InitialStake from './InitialStake'
import YbNftSummaryChart from './YbNftSummaryChart'
import toast from 'utils/toast'
import axios from 'axios'
import { getBalanceInEther } from 'utils/formatBalance'
import BigNumber from 'bignumber.js'
import { ArrowLeft } from 'react-feather'

const FormInitialStake = () => {
  const { wizard, setWizard, account, formData } = React.useContext(MintWizardContext)

  const [bnbBalance, setBNBBalance] = useState(0)

  const getBNBBalance = async () => {
    const balance = await axios.get(
      'https://api.bscscan.com/api?module=account&action=balance&address=' +
        account?.toString() +
        '&apikey=ZWKTR3X6EIE91YMHQ8RNUDHADI1795JXE1',
    )
    const balanceNumber = Number(balance?.data?.result)
    console.log(balanceNumber)
    setBNBBalance(getBalanceInEther(new BigNumber(balanceNumber)))
  }

  useEffect(() => {
    account && getBNBBalance()
  }, [account])

  const handleNext = () => {
    if (!account) {
      toast('Please connect your wallet to continue !!')
      return
    }
    if (formData.initialStake > bnbBalance) {
      toast('Entered amount greater than available BNB balance !!', 'warning')
      return
    }
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
      <Box
        sx={{
          flex: 1,
        }}
      >
        <InitialStake />
        <Box mt={24} sx={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
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

export default FormInitialStake
