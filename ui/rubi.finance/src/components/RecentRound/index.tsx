import React from 'react';
import styles from './style';
import { Heading, Text, Card, Flex } from 'theme-ui';
import { Round } from './types'

const RecentRound: React.FC = () => {

  const round: Round = {
    no: 256,
    ticket: 123456,
    potSize: '$123,456',
    totalPlayers: 1265
  }

  return (
    <Card variant='noPadding' sx={styles.container}>
      <Flex>
        <Text sx={styles.borderClip}>{round.no}</Text>
        <Text sx={styles.title}>RECENT WINNING ROUND</Text>
      </Flex>
      <Flex sx={styles.row}>
        <Flex sx={styles.titleBox}>
          <Heading sx={styles.rowTitle}>WINNING TICKET:</Heading>
        </Flex>
        <Flex sx={styles.viewBox}>
          <Text sx={styles.box1Text}>{round.ticket}</Text>
        </Flex>
      </Flex>
      <Flex sx={styles.row}>
        <Flex sx={styles.titleBox}>
          <Heading sx={styles.rowTitle}>POT SIZE:</Heading>
        </Flex>
        <Flex sx={styles.viewBox}>
          <Text sx={styles.box2Text}>{round.potSize}</Text>
        </Flex>
      </Flex>
      <Flex sx={styles.row}>
        <Flex sx={styles.titleBox}>
          <Heading sx={styles.rowTitle}>TOTAL PLAYERS:</Heading>
        </Flex>
        <Flex sx={styles.viewBox}>
          <Text sx={styles.box3Text}>{round.totalPlayers}</Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default RecentRound;
