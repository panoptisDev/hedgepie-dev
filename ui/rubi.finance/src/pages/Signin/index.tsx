import React from 'react';
import styles from './style';
import { Heading, Button, Card, Input, Flex } from 'theme-ui';
import { Helmet } from 'react-helmet';


const SigninPage: React.FC = () => {

  return (
    <>
      <Helmet>
        <meta
          name="description"
          content="Earn yeild on your RUBI tokens and yield bearing NFTs!"
        />
        <meta
          name="robots"
          content="index, follow"
        />
      </Helmet>
      <Flex sx={styles.wrapper}>
        <Card sx={styles.container}>
          <Heading sx={styles.title}>
            Login
          </Heading>
          <Input
            name='email'
            sx={styles.textBox}
            placeholder='Email'
          />
          <Input
            name='password'
            sx={styles.textBox}
            placeholder='Password'
          />
          <div>
            <Button sx={styles.cta}>
              LOGIN
            </Button>
          </div>
        </Card>
      </Flex>
    </>
  );
};

export default SigninPage;
