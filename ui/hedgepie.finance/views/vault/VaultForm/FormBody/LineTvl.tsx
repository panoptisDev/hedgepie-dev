import { Box } from 'theme-ui'

const LineTvl = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >
      <Box
        sx={{
          color: '#16103A',
          fontWeight: 700
        }}
      >
        TVL
      </Box>
      <Box
        sx={{
          color: '#DF4886',
          fontWeight: 700
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default LineTvl