import React from 'react'
import { Box } from 'theme-ui'

const TableHeadStaked = () => {
  return (
    <th>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box>SHOW STAKED</Box>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: 2,
            backgroundColor: '#1799DE',
            marginLeft: 1
          }}
        />
      </Box>
    </th>
  )
}

export default TableHeadStaked