import { Box } from 'theme-ui'

const TabButton = ({ active = false, label, ...props }) => {

  // WITHDRAW

  return (
    <Box
      sx={{
        width: '50%',
        backgroundColor: active ? '#16103A' : 'transparent',
        color: active ? '#fff' : '#fff8',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: active ? 'default' : 'pointer',
        transition: 'all .2s',
        userSelect: 'none',
        '&:hover': {
          color: '#fff',
        },
        '&:active': {
          color: active ? '#fff' : '#fffc',
        },
      }}
      {...props}
    >
      {label}
    </Box>
  )
}

export default TabButton