import React, { useState, useEffect } from 'react'

import { HPButtonInput } from 'widgets/HPButtonInput'
import { HPInput } from 'widgets/HPInput'
import { HPInstrumentSelect } from 'widgets/HPInstrumentSelect'
import { HPVaultSummary } from 'widgets/HPVaultSummary'

type Props = {}

const WithdrawCard = (props: Props) => {
  const [apyVal, setApy] = useState('')
  const [profitVal, setProfit] = useState('')
  const [stakedVal, setStaked] = useState('')
  const [tvlVal, setTVL] = useState('')

  return (
    <>
      Withdraw Form
      <HPInstrumentSelect />
      <HPInput label="STAKED" placeholder={stakedVal} />
      <HPInput label="APY" placeholder={apyVal + '%'} />
      <HPInput label="Profit" placeholder={profitVal} />
      <HPButtonInput placeholder="0.00" />
      <HPVaultSummary tvl={'$' + tvlVal} />
    </>
  )
}

export default WithdrawCard
