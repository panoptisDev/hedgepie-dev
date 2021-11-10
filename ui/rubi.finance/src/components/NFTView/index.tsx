import React from 'react';
import styles from './style';
import { Heading, Text, Button, Card, Box, Flex } from 'theme-ui';
import { View } from './types'

const NFTView: React.FC = () => {

  const item: View = {
    id: '23',
    name: 'YB-NFT NAME',
    product: 'Beautiful Jewel',
    rarity: 20,
    tier: 4
  }

  return (
    <Card variant='noPadding'>
      <div sx={styles.headerSection}>01:02:03 UNTIL NEXT DRAW</div>
      <Box p={4}>
        <Flex sx={styles.contentSection}>
          <div sx={{ flexBasis: ['100%', '60%'] }}>
            <Text variant='block'>{item.name}</Text>
            <Text variant='block' sx={{color: 'black'}}>{item.product} #{item.id}</Text>
            <Text variant='block' sx={{color: 'black'}}>Sub Title Here</Text>
            <Flex sx={{ columnGap: '1em'}}>
              <Flex sx={{ flexBasis: '50%', alignItems: 'end', columnGap: '.5em' }}>
                <Box sx={styles.infoLeftBox}>
                  <Text sx={styles.infoTitle}>RARITY: </Text>
                  <Text sx={{ fontSize: '12px' }}>VERY RARE {item.rarity}/100</Text>
                </Box>
                <Box sx={styles.infoRightBox}>
                  <Text sx={styles.infoTitle}>TIER: </Text>
                  <Text sx={{ fontSize: '12px' }}>{item.tier}</Text>
                </Box>
              </Flex>
              <Button 
                variant='default'
                sx={{
                  flexBasis: '50%',
                  fontSize: '12px'
                }}
              >
                VIEW CONTENTS
              </Button>
            </Flex>
            <Flex sx={{ columnGap: '.5em', marginTop: '2em' }}>
              <Box p={3} sx={styles.bottomBox}>
                <Text variant='block' sx={{color: '#62e1b1'}}>APR</Text>
                <Text variant='block' sx={{color: 'black'}}>5%</Text>
                <Text variant='block' sx={{color: 'black'}}>Sub Title Here</Text>
              </Box>
              <Box p={3} sx={styles.bottomBox}>
                <Text variant='block' sx={{color: '#62e1b1'}}>YOUR STAKE</Text>
                <Text variant='block' sx={{color: 'black'}}>0</Text>
                <Text variant='block' sx={{color: 'black'}}>Sub Title Here</Text>
              </Box>
            </Flex>
          </div>
          <div sx={{ flexBasis: ['100%', 'calc(40% - 1em)'] }}>
            Right
          </div>
        </Flex>
        <Flex sx={{justifyContent: 'center'}}>
          <Button sx={styles.ctaButton}>CONNECT WALLET</Button>
        </Flex>
      </Box>
    </Card>
  );
};

export default NFTView;
