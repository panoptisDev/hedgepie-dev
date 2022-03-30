import React from 'react'
import { Flex, Text } from 'theme-ui'

type Props = { tvl: string }

const HPVaultSummary = (props: Props) => {
  const { tvl } = props
  return (
    <Flex css={{ flexDirection: 'column', gap: '5px', padding: '10px' }}>
      <Flex css={{ padding: '0rem 1rem 0rem 1rem' }}>
        <Text
          css={{
            color: '#16103A',
            fontWeight: '700',
            lineHeight: '28px',
            fontFamily: 'Noto Sans',
          }}
        >
          TVL
        </Text>
        <Text
          css={{
            marginLeft: 'auto',
            color: '#DF4886',
            fontWeight: '700',
            lineHeight: '28px',
            fontFamilt: 'Noto Sans',
          }}
        >
          {tvl}
        </Text>
      </Flex>
    </Flex>
  )
}

export default HPVaultSummary
