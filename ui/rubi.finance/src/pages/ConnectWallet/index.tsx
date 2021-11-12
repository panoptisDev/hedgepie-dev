import React from 'react';
import styles from './style';
import { Heading, Button, Card, Input, Flex } from 'theme-ui';
import {
  Header,
  FooterSection,
  MultiConnect
} from 'components';
import { Helmet } from 'react-helmet';


const ConnectWalletPage: React.FC = () => {

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

      <Header />
      <Flex sx={styles.flexContainer}>
        <MultiConnect />
      </Flex>
      <FooterSection />
    </>
  );
};

export default ConnectWalletPage;
