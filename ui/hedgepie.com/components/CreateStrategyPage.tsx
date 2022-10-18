import React from "react";
import { Box } from "theme-ui";
import HedgePieHero from "components/HedgePieHero";
import StrategyList from "components/StrategyList";
import Features from "components/Features";

function CreateStrategyPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <HedgePieHero
        titleLine1="Get a piece of the Defi pie,"
        titleLine2="without the hassle."
        subTitle="Hedgepie is a DeFi strategy marketplace that makes it :EASY for new investors to have their investments safely managed: by expert crypto investors."
        buttonText="Start Investing"
        buttonClick={() => {}}
      />
      <StrategyList textLine1="Enjoy diversified strategies cut across top DeFi protocols." />
      <Features type="create" />
    </Box>
  );
}

export default CreateStrategyPage;
