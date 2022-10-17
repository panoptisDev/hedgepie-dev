import React from "react";
import { Box } from "theme-ui";
import HedgePieHero from "./HedgePieHero";

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
    </Box>
  );
}

export default CreateStrategyPage;
