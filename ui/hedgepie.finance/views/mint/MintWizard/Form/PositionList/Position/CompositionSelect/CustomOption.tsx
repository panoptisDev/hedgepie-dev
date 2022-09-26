import React from 'react'
import { Box, Image } from 'theme-ui'

const CustomOption = ({ data, setValue }) => {
  return (
    <Box
      sx={{
        height: 40,
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#eee',
        },
      }}
      onClick={() => setValue(data)}
    >
      {data.icon ? (
        <Image
          src={data.icon}
          sx={{
            width: 20,
            height: 20,
          }}
        />
      ) : (
        ''
      )}
      <Box
        sx={{
          ml: 2,
          color: '#0A3F5C',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {data.name}
      </Box>
    </Box>
  )
}

export default CustomOption
