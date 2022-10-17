import Head from "next/head";
import React from "react";
import { Box } from "theme-ui";
import Header from "components/Header";

interface HedgePiePageProps {
  children?: React.ReactNode;
}

function HedgePiePage(props: HedgePiePageProps) {
  const { children } = props;
  return (
    <>
      <Head>
        <title>HedgePie</title>
        <meta
          name="description"
          content="Access to the best strategies in DeFi"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
        <Header />
        <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
      </Box>
    </>
  );
}

export default HedgePiePage;
