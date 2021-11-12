import React, { useState, useEffect } from 'react'
import styles from './style'
import { Button, Grid, Container, Card, Box, Flex, Heading } from 'theme-ui';

const MultiConnect: React.FC<any> = () => {
  return (
    <Card sx={styles.container}>
      <Heading sx={styles.titleText}>Connect a Wallet</Heading>
      <Grid gap={4} columns={[2, null, 2]}>
        <Box sx={styles.items} >Metamask</Box>
        <Box sx={styles.items} >walletConnect</Box>
        <Box sx={styles.items} >trust wallet</Box>
        <Box sx={styles.items} >more</Box>
      </Grid>
    </Card>
  )
}

export default MultiConnect;