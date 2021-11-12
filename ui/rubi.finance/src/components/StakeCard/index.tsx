import React, { useState, useEffect } from 'react'
import style from './style'
import { Button, Container, Text, Paragraph, Box, Heading, Grid } from 'theme-ui';

const StakeSection: React.FC<any> = () => {
  return (
    <Grid gap={0} columns={[2, null, 2]}>
      <Box sx={style.left}>
        <Text sx={style.leftHeadingTitle}>Stake to win </Text>
        <Paragraph sx={style.headingContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco
        </Paragraph>
        <Button sx={style.darkButton}>Stake Now </Button>
      </Box>
      <Box sx={style.right}>
        <Text sx={style.rightHeadingTitle}>Collect Winnings</Text>
        <Paragraph sx={style.headingContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco
        </Paragraph>
        <Button sx={style.whiteButton}>Collect Winnings</Button>
      </Box>
    </Grid>
  )
}

export default StakeSection