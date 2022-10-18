import type { NextPage } from "next";
import Head from "next/head";
import HedgePiePage from "components/HedgePiePage";
import { Button } from "theme-ui";
import CreateStrategyPage from "components/CreateStrategyPage";

const Home: NextPage = () => {
  return (
    <HedgePiePage type="invest">
      <CreateStrategyPage />
    </HedgePiePage>
  );
};

export default Home;
