import React from 'react'
import { Box, Flex, Image } from 'theme-ui'
import SymbolInfo from './SymbolInfo'

const StrategyComposition = ({ ...props }) => {
  return (
    <Box
      sx={{
        padding: 20,
        border: '1px solid rgba(142, 141, 160, .42)',
        borderRadius: 10
      }}
      {...props}
    >
      <Box
        sx={{
          fontSize: 24,
          fontWeight: 900
        }}
      >
        Strategy Composition
      </Box>
      <Flex
        sx={{
          marginTop: 20,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <SymbolInfo
          symbolSrc="/images/symbol1.png"
          title="1.9"
          description="(-1,213.95 USD)"
        />
        <SymbolInfo
          symbolSrc="/images/symbol2.png"
          title="33"
          description="(-1,213.95 USD)"
        />
        <SymbolInfo
          symbolSrc="/images/symbol3.png"
          title="5000"
          description="(-1,213.95 USD)"
        />
        <SymbolInfo
          symbolSrc="/images/symbol1.png"
          title="1.9"
          description="(-1,213.95 USD)"
        />
        <SymbolInfo
          symbolSrc="/images/symbol2.png"
          title="3"
          description="(-1,213.95 USD)"
        />
      </Flex>
    </Box>
  )
}

export default StrategyComposition