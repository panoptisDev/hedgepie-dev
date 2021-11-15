import React from 'react';
import styles from './style';
import { Container, Flex } from 'theme-ui';
import {
  Header,
  FooterSection,
  VaultTable,
} from 'components';
import { Helmet } from 'react-helmet';


const MyCollectionPage: React.FC = () => {

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
      <Container sx={styles.flexContainer}>
        <VaultTable />
      </Container>
      <FooterSection />
    </>
  );
};

export default MyCollectionPage;
