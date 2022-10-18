import React from "react";
import { Box, Text } from "theme-ui";
import HedgePieButton from "widgets/HedgePieButton";

function CreateMidBanner() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 0",
        gap: "80px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          fontFamily: "Open Sans",
          width: "40rem",
        }}
      >
        <Text
          sx={{
            color: "#475569",
            letterSpacing: "0.15em",
            fontSize: "18px",
          }}
        >
          EARN MORE AS A STRATEGY CREATOR
        </Text>
        <Text sx={{ color: "#14114B", fontSize: "36px", fontWeight: "600" }}>
          Put your investment strategy into action. Get the best returns!
        </Text>
        <Text sx={{ color: "#1A1A1A", fontWeight: "400", fontSize: "24px" }}>
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
