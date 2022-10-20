/* eslint-disable no-use-before-define */
import React from "react";
import type { AppProps } from "next/app";

import Script from "next/script";
import Router from "next/router";
import "../styles/global.css";
import Head from "next/head";
import { hotjar } from "react-hotjar";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    hotjar.initialize(3196236, 6);
  }, []);

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=G-G6LN726K38`}
        id="ga-script"
      />
      <Script strategy="lazyOnload" id="ga-script-sec">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-G6LN726K38', {
        page_path: window.location.pathname,
        });
        `}
      </Script>

      <Head>
        <title>Hedge Pie</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
