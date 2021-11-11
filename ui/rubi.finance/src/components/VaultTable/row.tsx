import React, { useState } from 'react';
import styles from './style';
import { Heading, Text, Button, Box, Flex, Label, Input } from 'theme-ui';
import { Instrument, View } from './types'

interface IRow {
  active?: View,
  data: Instrument[]
}

const Row: React.FC<IRow> = ({ active, data }) => {

  return (
    <>
      {data.map((nft, index) => {
        return (
          <tr key={nft.name + index} sx={styles.row}>
            <td sx={styles.cell}>
              <div sx={styles.placeholder}></div>
            </td>
            <td sx={styles.cell}>
              <Text>{nft.platform}</Text>
            </td>
            <td sx={styles.cell}>
              <Text>${nft.tvl}</Text>
            </td>
            <td sx={styles.cell}>
              <Text>{nft.markedStaked} {nft.symbol}</Text>
            </td>
            <td sx={styles.cell}>
              <Text>{nft.daily}%</Text>
            </td>
            <td sx={styles.cell}>
              <Flex sx={styles.buttonCell}>
                <Text>{nft.apy}%</Text>
                {active == 'MY COLLECTION' && 
                  <Button variant='default' sx={styles.rowButton}>
                    COLLECT WINNINGS
                  </Button>
                }
              </Flex>
            </td>
          </tr>
        )
      })}
    </>
  );
};

export default Row;
