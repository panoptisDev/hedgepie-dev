import React from "react";
import { Box } from "theme-ui";
import HedgePieHero from "components/HedgePieHero";
import StrategyList from "components/StrategyList";
import Features from "components/Features";
import CreateMidBanner from "components/CreateMidBanner";
import SubContents from "components/SubContents";
import SellingPoints from "components/SellingPoints";
import AuditedBy from "components/AuditedBy";
import FinalBanner from "components/FinalBanner";
import Footer from "components/Footer";
import InvestStrategySteps from "components/InvestStrategySteps";

function InvestPage() {
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
      <Features type="invest" />
      <CreateMidBanner />
      <SubContents type="invest" />
      <SellingPoints type="invest" />
      <AuditedBy />
      <FinalBanner type="invest" />
      <Footer />
    </Box>
  );
}

export default InvestPage;
