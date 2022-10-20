import type { NextPage } from "next";
import Head from "next/head";
import HedgePiePage from "components/HedgePiePage";
import { Button } from "theme-ui";
import InvestPage from "components/InvestPage";

const Home: NextPage = () => {
  return (
    <HedgePiePage type="invest">
      <InvestPage />
    </HedgePiePage>
  );
};

export default Home;
