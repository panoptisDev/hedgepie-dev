import React from 'react';
import styles from './style';
import { Heading, Text, Button, Card, Box, Flex, Grid } from 'theme-ui';
import { Lottery } from './types'

const LotteryList: React.FC = () => {

  const data: Lottery = {
    name: 'NFT Name',
    stake: 10,
    totalStaked: 5,
    timeLeft: '01:02:03'
  }

  return (
    <Card variant='noPadding' sx={styles.container}>
      <table sx={styles.table}>
        <thead>
          <tr>
            <th sx={styles.tableHeadingCell}>
              <Heading sx={styles.tableHeading}>YB-NFT NAME</Heading>
            </th>
            <th sx={styles.tableHeadingCell}>
              <Heading sx={styles.tableHeading}>YOUR STAKE</Heading>
            </th>
            <th sx={styles.tableHeadingCell}>
              <Heading sx={styles.tableHeading}>TOTAL STAKED</Heading>
            </th>
            <th sx={styles.tableHeadingCell}>
              <Heading sx={styles.tableHeading}>TIME LEFT</Heading>
            </th>
          </tr>
        </thead>
        <tbody>
          {[data, data, data].map((nft, index) => {
            return (
              <tr sx={styles.row} key={nft.name + index}>
                <td sx={styles.cell}>
                  <Text>{nft.name}</Text>
                </td>
                <td sx={styles.cell}>
                  <Text>{nft.stake}</Text>
                </td>
                <td sx={styles.cell}>
                  <Text>{nft.totalStaked}</Text>
                </td>
                <td sx={styles.cell}>
                  <Flex sx={styles.buttonCell}>
                    <Text>{nft.timeLeft}</Text>
                    <Flex sx={styles.buttonContainer}>
                      <Button variant='default' sx={styles.leftButton}>
                        VIEW CONTENTS
                      </Button>
                      <Button sx={styles.rightButton}>
                        STAKE
                      </Button>
                    </Flex>
                  </Flex>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <Flex sx={{justifyContent: 'center'}}>
          <Button sx={styles.ctaButton}>CONNECT WALLET</Button>
        </Flex>
    </Card>
  );
};

export default LotteryList;
