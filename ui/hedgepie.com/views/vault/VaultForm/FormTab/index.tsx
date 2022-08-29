import { Box } from 'theme-ui'
import TabButton from './TabButton'

const FormTab = ({ value, onChange }) => {
  return (
    <Box
      sx={{
        height: 66,
        borderRadius: 12,
        display: 'flex',
        backgroundColor: '#79C8F2',
      }}
    >
      <TabButton active={value === 'DEPOSIT'} onClick={() => onChange('DEPOSIT')} label="Stake" id="stake-tab" />
      <TabButton
        active={value === 'WITHDRAW'}
        onClick={() => onChange('WITHDRAW')}
        label="Withdraw"
        id="withdraw-tab"
      />
    </Box>
  )
}

export default FormTab
