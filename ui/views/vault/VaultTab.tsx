import { Box } from 'theme-ui'
import VaultTabBtn from './VaultTabBtn'

const VaultTab = ({ value, onChange }) => {

  return (
    <Box
      sx={{
        height: 66,
        borderRadius: 12,
        display: 'flex',
        backgroundColor: '#79C8F2',
      }}
    >
      <VaultTabBtn
        active={value === 'DEPOSIT'}
        onClick={() => onChange('DEPOSIT')}
      >
        Stake
      </VaultTabBtn>
      <VaultTabBtn
        active={value === 'WITHDRAW'}
        onClick={() => onChange('WITHDRAW')}
      >
        Withdraw
      </VaultTabBtn>
    </Box>
  )
}

export default VaultTab