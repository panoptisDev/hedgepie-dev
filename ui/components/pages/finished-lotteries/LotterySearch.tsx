import React from "react"
import { Box, Input, Button } from "theme-ui"

const LotterySearch = ({ onSearch }: any) => {

  const handleChange = (e: any) => {
    onSearch(e.target.value);
  }

  return (
    <Box
      sx={{
        bg: 'details',
        height: 120,
        padding: 30,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Input
        sx={{
          maxWidth: 300,
          height: 60,
          backgroundColor: '#fff',
          border: 'none',
          outline: 'none',
          borderRadius: 30,
          paddingLeft: 24,
          paddingRight: 24,
          fontSize: 14
        }}
        placeholder="Search by name, symbol, address ..."
        onChange={handleChange}
      />
      <Box
        sx={{
          fontSize: 24,
          color: '#fff'
        }}
      >
        Finished Rounds
      </Box>
    </Box>
  )
}

export default LotterySearch