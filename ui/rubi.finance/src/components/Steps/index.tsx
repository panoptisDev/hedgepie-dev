import React, { useState, useEffect } from 'react'
import styles from './style'
import { Button, Text, Container, Heading, Box, Flex, Paragraph } from 'theme-ui';

const StepsView: React.FC<any> = () => {
  return (
    <>
      <Flex sx={styles.flexContainer}>
        <Text sx={styles.textTitle}>
          Stake. Earn. Win.
        </Text>
        <Text sx={styles.textContent}>Stake to earn rewards while entering
          for a chance to win the jackpot
        </Text>
      </Flex>
      <Flex sx={styles.stepsContainer}>
        <div sx={styles.stepContainOne}>
          <Text sx={styles.stepsOne}>
            Step 1
          </Text>
          <Heading sx={styles.stepTitle}>Stake With Rubi</Heading>
          <Paragraph sx={styles.stepContent}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            dignissim sit amet massa nec.
          </Paragraph>
        </div>
        <div sx={styles.stepContain}>
          <Text sx={styles.steps}>
            Step 2
          </Text>
          <Heading sx={styles.stepTitle}>Wait for the Draw</Heading>
          <Paragraph sx={styles.stepContent}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            dignissim sit amet massa nec.
          </Paragraph>

        </div>
        <div sx={styles.stepContain}>
          <Text sx={styles.steps}>
            Step 3
          </Text>
          <Heading sx={styles.stepTitle}>Claim Rewards</Heading>
          <Paragraph sx={styles.stepContent}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            dignissim sit amet massa nec.
          </Paragraph>

        </div>
      </Flex>
    </>
  )
}

export default StepsView;