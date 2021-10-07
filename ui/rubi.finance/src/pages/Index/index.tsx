import React, { useEffect } from 'react';
import styles from './style';
import { MimoblRoutePath, RedirectState } from 'Pages/routes';
import { Heading, Text, Button } from 'theme-ui';
import { Helmet } from 'react-helmet';
import { ConnectWallet } from 'components';


const IndexPage: React.FC = () => {

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
      <ConnectWallet />
    </>
  );
};

export default IndexPage;
