import Head from "next/head";
import React from "react";
import { Box } from "theme-ui";
import Header, { PageType } from "components/Header";

interface HedgePiePageProps {
  children?: React.ReactNode;
  type: PageType;
}

function HedgePiePage(props: HedgePiePageProps) {
  const { children, type } = props;
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
        <Header selected={type} />
        <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
      </Box>
    </>
  );
}

export default HedgePiePage;
