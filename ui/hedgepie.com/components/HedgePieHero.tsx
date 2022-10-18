import Image from "next/image";
import React from "react";
import { Box, Text } from "theme-ui";
import HedgePieButton from "widgets/HedgePieButton";

interface HedgePieHeroProps {
  titleLine1: string;
  titleLine2: string;
  subTitle: string;
  buttonText: string;
  buttonClick: () => void;
}

function HedgePieHero(props: HedgePieHeroProps) {
  const { titleLine1, titleLine2, subTitle, buttonText, buttonClick } = props;
  const subTitleParts = subTitle.split(":");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "40rem",
        opacity: "1",
        backgroundColor: "#251d56",
        gap: "10px",
      }}
    >
      <Box sx={{ position: "absolute", opacity: "0.05" }}>
        <Image src="/images/hero-bg.png" height="1700" width="4000" />
      </Box>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Text
          sx={{
            fontFamily: "Open Sans",
            fontStyle: "normal",
            fontWeight: "600",
            fontSize: "72px",
            lineHeight: "125%",
            color: "#FFFFFF",
          }}
        >
          {titleLine1}
        </Text>
        <Text
          sx={{
            fontFamily: "Open Sans",
            fontStyle: "normal",
            fontWeight: "600",
            fontSize: "72px",
            lineHeight: "125%",
            color: "#FFFFFF",
          }}
        >
          {titleLine2}
        </Text>
      </Box>
      <Box sx={{ width: "60rem" }}>
        <Text
          sx={{
            fontFamily: "Open Sans",
            fontStyle: "normal",
            fontWeight: "300",
            fontSize: "32px",
            lineHeight: "125%",
            display: "inline-block",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#FFFFFF" }}>{subTitleParts[0]}</span>
          <span style={{ color: "#EFA906", fontWeight: "400" }}>
            {subTitleParts[1]}
          </span>
          <span style={{ color: "#FFFFFF" }}>{subTitleParts[2]}</span>
        </Text>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "20px",
        }}
      >
        <HedgePieButton label="Start Investing" size="medium" />
      </Box>
    </Box>
  );
}

export default HedgePieHero;
