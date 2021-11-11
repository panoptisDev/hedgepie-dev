import React, { useEffect, useState } from 'react';
import styles from './style';
import { Heading, Flex, Button } from 'theme-ui';

const ErrorPage: React.FC = () => {
  
  return (
    <Flex 
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        paddingY: '5em'
      }}
    >
      <Heading sx={styles.errorText}>Whoops .</Heading>
      <Heading sx={styles.errorText}>You need to login to see that .</Heading>
      <Flex sx={{ marginTop: '3em' }}>
        <Button variant='default' sx={styles.rowButton}>
          LOGIN
        </Button>
        <Button variant='default'sx={styles.rowButton}>
          CREATE ACCOUNT
        </Button>
      </Flex>
    </Flex>
  );
};

export default ErrorPage;
