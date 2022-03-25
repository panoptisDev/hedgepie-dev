import React from 'react'
import { Box, Image, Flex, Button } from 'theme-ui'
import Tag from './Tag'

const NftInfo = ({ ...props }) => {
  return (
    <Box {...props}>
      <Flex>
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
              fontSize: 30,
              fontWeight: 700,
              color: '#16103A'
            }}
          >
            Yield Bearing NFT Name #7090
          </Box>
          <Box mt={3}>
            <Tag
              label="TLV:"
              value="$5,000"
            />
            <Tag
              label="TLV:"
              value="$5,000"
              ml={2}
            />
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Flex sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              color: '#ABABAB',
              fontSize: 20,
              fontWeight: 900,
              marginRight: 24
            }}
          >
            OWNER
          </Box>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%'
            }}
          >
            <Image src="/images/owner.png" />
          </Box>
        </Flex>
      </Flex>
      <Flex
        sx={{
          marginTop: 24,
          gap: 24,
          '& > *': {
            flex: 1
          }
        }}
      >
        <Button
          variant="primary"
          sx={{
            borderRadius: 40,
            height: 64,
            padding: '0 40px',
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          <Box mr={2}>
            STAKE
          </Box>
        </Button>
        <Button
          variant="info"
          sx={{
            borderRadius: 40,
            border: '1px solid #1799DE',
            height: 64,
            padding: '0 40px',
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          <Box mr={2}>
            VIEW CONTENTS
          </Box>
        </Button>
      </Flex>
    </Box>
  )
}

export default NftInfo