import { Box } from 'theme-ui'
import { ChevronDown } from 'react-feather';

const TableHeadSortable = ({ label, active, ...props }) => (
  <Box as="th">
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        color: active ? '#DF4886' : '#000'
      }}
      {...props}
    >
      <Box mr={1}>
        {label}
      </Box>
      <ChevronDown size={16} />
    </Box>
  </Box>
)

export default TableHeadSortable