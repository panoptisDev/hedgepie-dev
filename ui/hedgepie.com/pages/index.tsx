import type { NextPage } from "next";
import Head from "next/head";
import HedgePiePage from "components/HedgePiePage";
import CreateStrategyPage from "components/CreateStrategyPage";
import { Button } from "theme-ui";

const Home: NextPage = () => {
  return (
    <HedgePiePage>
      <CreateStrategyPage />
    </HedgePiePage>
  );
};

export default Home;
