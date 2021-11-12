import React, { useEffect } from 'react';
import styles from './style';
import { Heading, Flex, Grid, Paragraph, Text } from 'theme-ui';
import { Helmet } from 'react-helmet';
import {
  StepView,
  Header,
  StakeSection,
  FooterSection,
  PreviousRounds,
  RecentRound,
  NFTView,
  LotteryList
} from 'components';

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
      <Header />
      <section sx={styles.stepView}>
        <StepView />
      </section>
      {/* <MultiConnect /> */}
      <section sx={styles.NftView}>
        <NFTView />
      </section>

      <section sx={styles.lotteriesContainer}>
        <Paragraph sx={styles.lotteriesTitle}>Ongoing Lotteries</Paragraph>
        <Paragraph sx={styles.stakeTitle}>stake now to earn lotteries</Paragraph>
        <LotteryList />

      </section>

      <section sx={styles.roundsContainer}>
        <Paragraph sx={styles.roundsTitle}>Finished Rounds</Paragraph>
        <Grid sx={styles.finishedRounds} gap={5} columns={[2, '1fr 2fr']}>
          <div>
            <PreviousRounds />
          </div>
          <div>
            <RecentRound />
          </div>
        </Grid>
      </section>

      <section sx={styles.stakeSection}>
        <StakeSection />
      </section>
      <FooterSection />
      {/* <ConnectWallet /> */}
    </>
  );
};

export default IndexPage;
