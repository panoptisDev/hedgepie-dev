import { useInvestor } from 'hooks/useInvestor'
import React from 'react'
import { Box, Button, Text, ThemeUICSSObject } from 'theme-ui'
import { styles } from './styles'

function Yield(props: any) {
  // TODO : Get Yield for the given account from the Investor Contract
  const {} = useInvestor()

  const handleWithdrawYield = async () => {}
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '9rem' }}>
        <Text sx={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>YIELD</Text>
        <Text sx={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>0.05 BNB</Text>
      </Box>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: '10px' }}>
        <Button sx={styles.withdraw_yield_button as ThemeUICSSObject} onClick={handleWithdrawYield}>
          CLAIM
        </Button>
        <Button
          sx={{ ...(styles.withdraw_yield_button as ThemeUICSSObject), marginLeft: 'auto' }}
          onClick={handleWithdrawYield}
        >
          COMPOUND
        </Button>
      </div>
    </Box>
  )
}

export default Yield
