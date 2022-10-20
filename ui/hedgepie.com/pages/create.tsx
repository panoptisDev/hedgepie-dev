import type { NextPage } from "next";
import HedgePiePage from "components/HedgePiePage";
import CreateStrategyPage from "components/CreateStrategyPage";

const Home: NextPage = () => {
  return (
    <HedgePiePage type="create">
      <CreateStrategyPage />
    </HedgePiePage>
  );
};

export default Home;
