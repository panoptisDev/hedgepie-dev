import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

// Components
import HomePage from "../components/HomePage";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Hedge Pie</title>
        <meta name="description" content="Hedge Pie Finance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <HomePage />
      </main>
    </div>
  );
};

export default Home;
