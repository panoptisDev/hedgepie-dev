import type { NextPage } from "next";
import HedgePiePage from "components/HedgePiePage";
import InvestPage from "components/InvestPage";

const Home: NextPage = () => {
  return (
    <HedgePiePage type="invest">
      <InvestPage />
    </HedgePiePage>
  );
};

export default Home;
