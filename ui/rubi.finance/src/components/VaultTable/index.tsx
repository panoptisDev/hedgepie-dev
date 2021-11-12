import React, { useEffect, useRef, useState } from 'react';
import styles from './style';
import { Heading, Text, Button, Box, Flex, Label, Input } from 'theme-ui';
import { IVaultTable, Instrument, View } from './types'
import Tab from './tab'
import Row from './row'
import ErrorPage from './error'

const VaultTable: React.FC<IVaultTable> = ({ view }) => {
  const [active, setActive] = useState<View>()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ref || !ref.current) {
      return
    }
    const input = ref.current
    const placeholder = input.getAttribute('placeholder') || ''
    input.setAttribute('size', placeholder.length.toString())
  }, [])

  const isSignedIn = true

  const data: Instrument = {
    name: 'NFT Name',
    platform: 'TakoDefi',
    tvl: 250000,
    markedStaked: 800000,
    daily: 0.14,
    apy: 63,
    symbol: 'TAKO'
  }

  return (
    <div>
      <Box sx={{ background: '#7c6de1', borderRadius: '10px' }}>
        <Flex sx={styles.topHeader}>
          <Flex sx={{ alignItems: 'center', columnGap: '1em' }}>
            <Label htmlFor='search' sx={styles.searchLabel}>SEARCH</Label>
            <Input
              ref={ref}
              name='search'
              id='search'
              sx={styles.searchBox}
              placeholder='Search by name, symbol or address'
            />
          </Flex>
          {active !== 'MY COLLECTION' &&
            <Button variant='default' sx={styles.topButton}>
              COMPOUND ALL
            </Button>
          }
        </Flex>
        <Tab view={view} setActiveTab={setActive} />
      </Box>
      {isSignedIn ?
        <table sx={styles.table}>
          <thead>
            <tr>
              <th sx={styles.tableHeadingCell}>
                <Heading sx={styles.tableHeading}>INSTRUMENTS</Heading>
              </th>
              <th sx={styles.tableHeadingCell}>
                <Heading sx={styles.tableHeading}>PLATFORM</Heading>
              </th>
              <th sx={styles.tableHeadingCell}>
                <Heading sx={styles.tableHeading}>TVL</Heading>
              </th>
              <th sx={styles.tableHeadingCell}>
                <Heading sx={styles.tableHeading}>MARKET STAKED</Heading>
              </th>
              <th sx={styles.tableHeadingCell}>
                <Heading sx={styles.tableHeading}>DAILY</Heading>
              </th>
              <th sx={styles.tableHeadingCell}>
                <Heading sx={styles.tableHeading}>APY</Heading>
              </th>
            </tr>
          </thead>
          <tbody>
            <Row active={active} data={[data, data, data]} />
          </tbody>
        </table>
        : <ErrorPage />}
    </div>
  );
};

export default VaultTable;
