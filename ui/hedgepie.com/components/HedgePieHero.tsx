import Image from "next/image";
import React from "react";
import { Box, Button, Text } from "theme-ui";
import HedgePieButton from "widgets/HedgePieButton";
import { isMobile } from "react-device-detect";

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
        {!isMobile && (
          <Image src="/images/hero-bg.png" height="1700" width="4000" />
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "1",
          width: ["80%", "100%", "100%"],
        }}
      >
        <Text
          sx={{
            fontFamily: "Open Sans",
            fontStyle: "normal",
            fontWeight: "600",
            fontSize: ["50px", "64px", "72px"],
            lineHeight: "125%",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          {titleLine1}
        </Text>
        <Text
          sx={{
            fontFamily: "Open Sans",
            fontStyle: "normal",
            fontWeight: "600",
            fontSize: ["50px", "64px", "72px"],
            lineHeight: "125%",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          {titleLine2}
        </Text>
      </Box>
      <Box sx={{ width: ["90%", "90%", "90%", "60rem"] }}>
        <Text
          sx={{
            fontFamily: "Open Sans",
            fontStyle: "normal",
            fontWeight: "300",
            fontSize: ["20px", "24px", "32px"],
            lineHeight: "125%",
            display: "inline-block",
            textAlign: "center",
            zIndex: "1",
          }}
        >
          <span style={{ color: "#FFFFFF", zIndex: "1" }}>
            {subTitleParts[0]}
          </span>
          <span style={{ color: "#EFA906", zIndex: "1", fontWeight: "400" }}>
            {subTitleParts[1]}
          </span>
          <span style={{ color: "#FFFFFF", zIndex: "1" }}>
            {subTitleParts[2]}
          </span>
        </Text>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "20px",
          zIndex: "1",
        }}
      >
        <HedgePieButton label={buttonText} size="medium" />
      </Box>
    </Box>
  );
}

export default HedgePieHero;
