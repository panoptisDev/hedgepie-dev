import React, { useState, useEffect } from 'react'
import HPButtonInput from 'components/Vault/HPButtonInput'
import { HPInput } from 'widgets/HPInput'
import { HPInstrumentSelect } from 'widgets/HPInstrumentSelect'
import { HPVaultSummary } from 'widgets/HPVaultSummary'

type Props = {}

const DepositCard = (props: Props) => {
  const [apyVal, setApy] = useState('')
  const [profitVal, setProfit] = useState('')
  const [stakedVal, setStaked] = useState('')
  const [tvlVal, setTVL] = useState('')

  return (
    <>
      Stake Form
      <HPInstrumentSelect />
      <HPInput label="STAKED" placeholder={stakedVal} />
      <HPInput label="APY" placeholder={apyVal + '%'} />
      <HPInput label="Profit" placeholder={profitVal} />
      <HPButtonInput placeholder="0.00" />
      <HPVaultSummary tvl={'$' + tvlVal} />
    </>
  )
}

export default DepositCard
