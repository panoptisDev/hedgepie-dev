import React from 'react'
import { Box, Image, Flex, Button } from 'theme-ui'
import Tag from './Tag'

const NftInfo = ({ ...props }) => {
  return (
    <Box {...props}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: ['column-reverse', 'column-reverse', 'column-reverse', 'column-reverse', 'row']
        }}
      >
        <Box>
          <Box
            sx={{
              color: '#DF4886',
              fontWeight: 700
            }}
          >
            Series Name
          </Box>
          <Box
            sx={{
              fontSize: [20, 30],
              fontWeight: 700,
              color: '#16103A'
            }}
          >
            Yield Bearing NFT Name #7090
          </Box>
          <Box
            mt={3}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <Tag
              label="TLV:"
              value="$5,000"
            />
            <Tag
              label="TLV:"
              value="$5,000"
            />
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              color: '#ABABAB',
              fontSize: [16, 20],
              fontWeight: 900,
              marginRight: [12, 24]
            }}
          >
            OWNER
          </Box>
          <Box
            sx={{
              width: [50, 100],
              height: [50, 100],
              borderRadius: '50%',
              flexShrink: 0
            }}
          >
            <Image src="/images/owner.png" />
          </Box>
        </Box>
      </Box>
      <Flex
        sx={{
          marginTop: 24,
          gap: 12,
          flexWrap: 'wrap',
          '& > *': {
            width: ['100%', 'calc(50% - 6px)']
          }
        }}
      >
        <Button
          variant="primary"
          sx={{
            borderRadius: 40,
            height: 64,
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          STAKE
        </Button>
        <Button
          variant="info"
          sx={{
            borderRadius: 40,
            border: '1px solid #1799DE',
            height: 64,
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          VIEW CONTENTS
        </Button>
      </Flex>
    </Box>
  )
}

export default NftInfo