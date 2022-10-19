import type { NextPage } from "next";
import HedgePiePage from "components/HedgePiePage";
import InvestPage from "components/CreateStrategyPage";

const Home: NextPage = () => {
  return (
    <HedgePiePage type="create">
      <InvestPage />
    </HedgePiePage>
  );
};

export default Home;
