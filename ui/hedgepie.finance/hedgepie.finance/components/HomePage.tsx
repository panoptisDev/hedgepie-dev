import React from "react";

import { Spinner } from "theme-ui";

/** @jsxImportSource theme-ui */
/** @jsx jsx */
/** @jsxRuntime classic */
import { ThemeProvider } from "theme-ui";
import { theme } from "../themes/theme";
import { jsx } from "theme-ui";
import { Text, Button, Flex } from "theme-ui";

import { ethers } from "ethers";

import { useState, useEffect } from "react";

import * as commonConstants from "../constants/common";

type Props = {};

const HomePage = (props: Props) => {
  const daiAddress = "dai.tokens.ethers.eth";

  const daiAbi = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",

    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)",
  ];

  /* All the State Variables for this particular component */

  var [provider, setProvider] = useState<any | undefined>();

  var [signer, setSigner] = useState<any | undefined>();

  var [daiContract, setDaiContract] = useState<any | undefined>();

  var [blockNumber, setBlockNumber] = useState(0);

  var [name, setName] = useState("");
  var [symbol, setSymbol] = useState("");

  var [nameLoading, setNameLoading] = useState(commonConstants.UNLOADED);
  var [symbolLoading, setSymbolLoading] = useState(commonConstants.UNLOADED);

  useEffect(() => {
    setProvider(new ethers.providers.Web3Provider(window.ethereum));
  }, []);

  useEffect(() => {
    provider?.getSigner && setSigner(provider.getSigner());
  }, [provider]);

  useEffect(() => {
    provider &&
      setDaiContract(new ethers.Contract(daiAddress, daiAbi, provider));
  }, [provider]);

  /* Functions */

  // Get Block from Ethereum
  var getBlock = async () => {
    setBlockNumber(await provider.getBlockNumber());
  };

  // Interact with a sample contract (DAI)
  var getName = async () => {
    if (daiContract) {
      setNameLoading(commonConstants.LOADING);
      setName(await daiContract.name());
      setNameLoading(commonConstants.LOADED);
    }
  };

  var getSymbol = async () => {
    if (daiContract) {
      setSymbolLoading(commonConstants.LOADING);
      setSymbol(await daiContract.symbol());
      setSymbolLoading(commonConstants.LOADED);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Flex
        sx={{
          flexDirection: "column",
          width: "100%",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Text as="h1" sx={{ color: "text", fontFamily: "monospace" }}>
          Checking Theme UI Working
        </Text>
        <Text
          as="h2"
          sx={{
            color: "primary",
            fontFamily: "heading",
          }}
        >
          Hello
        </Text>
        <Text as="h1" sx={{ color: "text", fontFamily: "monospace" }}>
          Checking Ethers JS Working
        </Text>
        <Button sx={{ backgroundColor: "primary" }} onClick={getBlock}>
          Get Block Number
        </Button>
        <Text
          sx={{
            color: "details",
            fontFamily: "heading",
          }}
        >
          {blockNumber}
        </Text>
        {/* For Contract Name */}
        <Button onClick={getName}>Get Contract Name</Button>
        {nameLoading === commonConstants.LOADING ? (
          <Spinner />
        ) : (
          <Text
            sx={{
              color: "details",
              fontFamily: "heading",
            }}
          >
            {name}
          </Text>
        )}
        {/* For Contract Symbol */}
        <Button onClick={getSymbol}>Get Contract Symbol</Button>
        {symbolLoading === commonConstants.LOADING ? (
          <Spinner />
        ) : (
          <Text
            sx={{
              color: "details",
              fontFamily: "heading",
            }}
          >
            {symbol}
          </Text>
        )}
      </Flex>
    </ThemeProvider>
  );
};

export default HomePage;
