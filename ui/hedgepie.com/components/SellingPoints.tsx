import React from "react";
import { Box, Text, Image } from "theme-ui";

interface SellingPointsProps {
  type: "create" | "invest";
}

const sellingPoints: any = {
  create: [
    {
      title: "Reduce your search time",
      text: "Today, investing in funds is a highly complex process. Every day, we spend countless hours searching for and finding new investment methods. With us, you can easily direct all your NFT-s to the top-performing funds.",
      image: "/images/sellingpoints/create/clock.svg",
    },
    {
      title: "Access the list of top performing DeFi strategies",
      text: "Expert defi investors are here to create top performing strategies which bring the highest yield. You just need to discover the highest-paying funds on our leaderboard and invest in them.",
      image: "/images/sellingpoints/create/medal.svg",
    },
    {
      title: "Generate the Highest yields with least risk",
      text: "Our leaderboard will show you the best performing strategies right away. You can invest in top-performing funds here, diversifying your investments while also ensuring their safety.",
      image: "/images/sellingpoints/create/coins.svg",
    },
    {
      title: "The highest level of security.",
      text: "Dozen of audits have been carried out on our smart contracts, making them perfectly bulletproof.",
      image: "/images/sellingpoints/create/shield.svg",
    },
  ],
  invest: [
    {
      title: "Reduce your search time",
      text: "Today, investing in funds is a highly complex process. Every day, we spend countless hours searching for and finding new investment methods. With us, you can easily direct all your NFT-s to the top-performing funds.",
      image: "/images/sellingpoints/invest/clock.svg",
    },
    {
      title: "Access the list of top performing DeFi strategies",
      text: "Expert defi investors are here to create top performing strategies which bring the highest yield. You just need to discover the highest-paying funds on our leaderboard and invest in them.",
      image: "/images/sellingpoints/invest/medal.svg",
    },
    {
      title: "Generate the Highest yields with least risk",
      text: "Our leaderboard will show you the best performing strategies right away. You can invest in top-performing funds here, diversifying your investments while also ensuring their safety.",
      image: "/images/sellingpoints/invest/coins.svg",
    },
    {
      title: "The highest level of security.",
      text: "Dozen of audits have been carried out on our smart contracts, making them perfectly bulletproof.",
      image: "/images/sellingpoints/invest/shield.svg",
    },
  ],
};

function SellingPoints(props: SellingPointsProps) {
  const { type } = props;
  return (
    <Box
      sx={{
        width: "100%",
        padding: ["40px 20px", "40px 20px", "40px 20px", "60px 100px"],
        background: "url(/images/sellingpoints/bg.svg)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: ["column", "column", "row", "row"],
            gap: ["20px", "30px", "30px", "60px"],
          }}
        >
          {[sellingPoints[type][0], sellingPoints[type][1]].map((sp: any) => (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "20px",
                width: ["90%", "90%", "22rem", "30rem"],
              }}
            >
              <Image
                src={sp.image}
                sx={{ width: ["200px", "200px", "200px", "300px"] }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  fontFamily: "Open Sans",
                }}
              >
                <Text
                  sx={{
                    color: "#14114B",
                    fontSize: ["18px", "20px", "20px", "22px"],
                    fontWeight: "600",
                  }}
                >
                  {sp.title}
                </Text>
                <Text
                  sx={{
                    color: "#475569",
                    fontSize: ["14px", "14px", "14px", "16px"],
                    fontWeight: "400",
                  }}
                >
                  {sp.text}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: ["column", "column", "row", "row"],
            gap: "40px",
          }}
        >
          {[sellingPoints[type][2], sellingPoints[type][3]].map((sp: any) => (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "20px",
                width: ["100%", "100%", "22rem", "30rem"],
              }}
            >
              <Image
                src={sp.image}
                sx={{ width: ["200px", "200px", "200px", "300px"] }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  fontFamily: "Open Sans",
                }}
              >
                <Text
                  sx={{ color: "#14114B", fontSize: "22px", fontWeight: "600" }}
                >
                  {sp.title}
                </Text>
                <Text
                  sx={{ color: "#475569", fontSize: "16px", fontWeight: "400" }}
                >
                  {sp.text}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default SellingPoints;
