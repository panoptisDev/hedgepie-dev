import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Paper: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/whitepaper.pdf");
  }, []);
  return <></>;
};

export default Paper;
