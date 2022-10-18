import Image from "next/image";
import React from "react";
import { Box, Text } from "theme-ui";

const steps = [
  {
    title: "Define your investment strategy.",
    text: "Use your investment experience to choose from dozens of protocols, and allocate funds.",
  },
  {
    title: "Set your performance fee",
    text: "Set a specific amount to be taken from the profits of those who invest in your strategy. Performance fee will only be taken from profits and not principal.",
  },
  {
    title: "Publish your strategy",
    text: "You are all set to publish your strategy. Go live. Get discovered. Use your shareable link, while your strategy also gets ranked on the leaderboard.",
  },
];

function InvestStrategySteps() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        padding: "50px 100px",
        flexDirection: "column",
        gap: "40px",
        fontFamily: "Open Sans",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text sx={{ color: "#14114B", fontWeight: "700", fontSize: "40px" }}>
        How do you earn with your Strategy?
      </Text>
      <Text sx={{ color: "#1A1A1A", fontWeight: "600", fontSize: "30px" }}>
        It's a simple 3-Step process.
      </Text>
      <Box sx={{ display: "flex", flexDirection: "row", gap: "20px" }}>
        {steps.map((s, i) => (
          <Box
            sx={{
              padding: "20px 40px 60px 20px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "2px solid #E3E3E3",
              boxShadow: "0px 1.06568px 21.3137px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              fontFamily: "Open Sans",
              width: "22rem",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "300px",
                border: "2px solid #E98EB3",
                fontWeight: "500",
                fontSize: "24px",
                width: "70px",
                height: "70px",
              }}
            >
              {i + 1}
            </Box>
            <Text
              sx={{ color: "#14114B", fontWeight: "700", fontSize: "24px" }}
            >
              {s.title}
            </Text>
            <Text
              sx={{ color: "#4F4F4F", fontWeight: "400", fontSize: "16px" }}
            >
              {s.text}
            </Text>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Text sx={{ color: "#DF4886", fontSize: "28px", fontWeight: "600" }}>
          Your HedgePie strategy is live!
        </Text>
        <Image src="/images/rocket.svg" width={80} height={80} />
      </Box>
    </Box>
  );
}

export default InvestStrategySteps;
