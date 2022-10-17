import Head from "next/head";
import React from "react";

interface HedgePiePageProps {
  children?: React.ReactNode;
}

function HedgePiePage(props: HedgePiePageProps) {
  return (
    <div>
      <Head>
        <title>HedgePie</title>
        <meta
          name="description"
          content="Access to the best strategies in DeFi"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </div>
  );
}

export default HedgePiePage;
