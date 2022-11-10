import React from "react";
import { Box, Text } from "theme-ui";
import HedgePieButton from "widgets/HedgePieButton";

interface FinalBannerProps {
  type: "create" | "invest";
}

const finalBanner: any = {
  invest: {
    line1: "Step safely into DeFi with HedgePie.",
    line2: "Don't wait any longer!",
    action: "Get Started →",
  },
  create: {
    line1: "Create top performing DeFi investment Strategies with HedgePie.",
    line2: "Don't wait any longer!",
    action: "Get Started →",
  },
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
        padding: ["30px 10px", "30px 20px", "30px 20px", "50px 100px"],
        gap: "30px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Plus Jakarta Sans",
        }}
      >
        <Text
          sx={{
            color: "#1A1A1A",
            fontSize: ["24px", "24px", "24px", "30px"],
            fontWeight: "600",
            textAlign: ["center", "center", "left", "left"],
          }}
        >
          {finalBanner[type].line1}
        </Text>
        <Text
          sx={{
            color: "#1A1A1A",
            fontSize: ["24px", "24px", "24px", "30px"],
            fontWeight: "600",
            textAlign: ["center", "center", "left", "left"],
          }}
        >
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
