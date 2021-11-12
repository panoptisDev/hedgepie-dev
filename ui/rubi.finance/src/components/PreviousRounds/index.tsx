import React from 'react';
import styles from './style';
import { Heading, Text, Card, Flex, Box } from 'theme-ui';
import { Round } from './types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'

const PreviousRounds: React.FC = () => {

  const rounds: Round[] = (new Array(8)).fill({
    date: 'September 9, 2021',
    time: '11:00 AM PST'
  })

  return (
    <>
      <Box sx={styles.container}>
        <Box sx={{background: 'black'}}>
          <Heading sx={styles.title}>PREVIOUS ROUNDS</Heading>
        </Box>
        <ul sx={styles.list}>
          {rounds.map(r => {
            return (
              <li sx={styles.listItem}>
                <Text sx={styles.rowText}>Drawn {r.date} @ {r.time}</Text>
                <FontAwesomeIcon sx={styles.caret} icon={faCaretRight} />
              </li>
            )
          })}
        </ul>
      </Box>
      <Flex sx={styles.cta}>
        <Heading sx={styles.ctaText}>PREVIOUS ROUNDS</Heading>
        <FontAwesomeIcon sx={styles.caret} icon={faCaretRight} />
      </Flex>
    </>
  );
};

export default PreviousRounds;
