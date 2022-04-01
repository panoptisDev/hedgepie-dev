import React from 'react'
import { Box, Image } from 'theme-ui'

const StackInfo = () => {
  return (
    <Box
      sx={{
        maxWidth: 320,
        flexShrink: 0,
        margin: ['0 auto']
      }}
    >
      <Box
        sx={{
          paddingBottom: '100%',
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Image
          src="/images/nft.png"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </Box>
      <Box
        sx={{
          marginTop: [16, 36],
          marginBottom: 16,
          padding: [16, 36],
          backgroundColor: '#FFFBF4',
          border: '1px solid #EFA906',
          borderRadius: 8
        }}
      >
        <Box sx={{ fontWeight: 700 }}>
          YOUR STAKE
        </Box>
        <Box
          sx={{
            marginTop: 16,
            fontSize: 30,
            fontWeight: 900,
            color: '#EFA906',
          }}
        >
          0
        </Box>
        <Box
          sx={{
            marginTop: 16,
            color: '#8E8DA0'
          }}
        >
          Oh-oh, you better do something about this.
        </Box>
      </Box>
    </Box>
  )
}

export default StackInfo