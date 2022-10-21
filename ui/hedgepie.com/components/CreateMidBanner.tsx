import Image from "next/image";
import React from "react";
import { Box, Text } from "theme-ui";
import HedgePieButton from "widgets/HedgePieButton";

function CreateMidBanner() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: ["column", "column", "column", "row"],
        justifyContent: "center",
        alignItems: "center",
        padding: ["30px 10px", "30px 10px", "30px 10px", "80px 0"],
        gap: ["20px", "20px", "30px", "80px"],
      }}
    >
      <Box
        sx={{
          position: "absolute",
          marginRight: "-1065px",
          zIndex: 0,
          display: ["none", "none", "none", "block"],
        }}
      >
        <Image
          src="/images/falling-coins-dark.svg"
          width={400}
          height={600}
          alt="falling coins"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          fontFamily: "Open Sans",
          width: ["90%", "90%", "90%", "40rem"],
        }}
      >
        <Text
          sx={{
            color: "#475569",
            letterSpacing: "0.15em",
            fontSize: ["16px", "16px", "16px", "18px"],
            textAlign: ["center", "center", "center", "left"],
          }}
        >
          EARN MORE AS A STRATEGY CREATOR
        </Text>
        <Text
          sx={{
            color: "#14114B",
            fontSize: ["24px", "24px", "24px", "36px"],
            fontWeight: "600",
            textAlign: ["center", "center", "center", "left"],
          }}
        >
          Put your investment strategy into action. Get the best returns!
        </Text>
        <Text
          sx={{
            color: "#1A1A1A",
            fontWeight: "400",
            fontSize: ["20px", "20px", "20px", "20px"],
            textAlign: ["center", "center", "center", "left"],
          }}
        >
          Make your valuable investment knowledge work for you. Set your
          performance fee, and earn more with high yields.
        </Text>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <HedgePieButton label="Create Strategies" size="large" />
      </Box>
    </Box>
  );
}

export default CreateMidBanner;
