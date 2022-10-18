import React from "react";
import { Box, Text } from "theme-ui";
import HedgePieButton from "widgets/HedgePieButton";

interface FinalBannerProps {
  type: "create" | "invest";
}

const finalBanner: any = {
  create: {
    line1: "Step safely into DeFi with HedgePie.",
    line2: "Don't wait any longer!",
    action: "Get Started →",
  },
  invest: { line1: "", line2: "", action: "" },
};

function FinalBanner(props: FinalBannerProps) {
  const { type } = props;
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, hsla(201, 81%, 48%, 0.15) 0%, hsla(336, 67%, 74%, 0.15) 61%)",
        padding: "50px 100px",
        gap: "30px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Open Sans",
        }}
      >
        <Text sx={{ color: "#1A1A1A", fontSize: "30px", fontWeight: "600" }}>
          {finalBanner[type].line1}
        </Text>
        <Text sx={{ color: "#1A1A1A", fontSize: "30px", fontWeight: "600" }}>
          {finalBanner[type].line2}
        </Text>
      </Box>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <HedgePieButton label={finalBanner[type].action} size="medium" />
      </Box>
    </Box>
  );
}

export default FinalBanner;
