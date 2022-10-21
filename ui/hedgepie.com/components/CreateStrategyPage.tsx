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

function CreateStrategyPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <HedgePieHero
        titleLine1="Monetize your valuable"
        titleLine2="investment knowledge."
        subTitle="HedgePie is a DeFi strategy marketplace that :makes it EASY for experienced investors to monetize their hard-earned investment knowledge: by creating reliable and profitable investment strategies."
        buttonText="Start Creating"
        buttonClick={() => {}}
      />
      <StrategyList
        textLine1="We’ve partnered with Top DeFi protocols so you can design a basket strategy,"
        textLine2="enjoying a wide range of options to choose from."
      />
      <Features type="create" />
      <InvestStrategySteps />
      <SubContents type="create" />
      <SellingPoints type="create" />
      <AuditedBy />
      <FinalBanner type="create" />
      <Footer />
    </Box>
  );
}

export default CreateStrategyPage;
