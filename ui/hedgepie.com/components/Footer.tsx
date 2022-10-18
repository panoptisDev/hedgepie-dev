import Image from "next/image";
import React from "react";
import { Box, Text } from "theme-ui";

const social = [
  { label: "", image: "/images/social/1.svg" },
  { label: "", image: "/images/social/2.svg" },
  { label: "", image: "/images/social/3.svg" },
  { label: "", image: "/images/social/4.svg" },
  { label: "", image: "/images/social/5.svg" },
];

const sections = [
  {
    title: "Create",
    links: [
      { label: "Strategies", link: "" },
      { label: "Pools", link: "" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Leaderboard", link: "" },
      { label: "Pools", link: "" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "How HedgePie Works", link: "" },
      { label: "Get a Slice!", link: "" },
      { label: "FAQs", link: "" },
      { label: "Whitepaper", link: "" },
    ],
  },
];

function Footer() {
  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          padding: "50px 100px",
          backgroundColor: "#14114B",
          gap: "60px",
        }}
      >
        <Box
          sx={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            gap: "40px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <Image src="/images/logo.svg" width={100} height={100} />
            <Text
              sx={{
                color: "#FFFFFF",
                fontFamily: "Open Sans",
                fontWeight: "600",
                fontSize: "54px",
              }}
            >
              HedgePie
            </Text>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              fontFamily: "Open Sans",
            }}
          >
            <Text sx={{ color: "#FFFFFF", fontSize: "18px" }}>
              HedgePie is a community-driven decentralized network of investors
              and crypto enthusiasts from all over the world.
            </Text>
            <Text sx={{ color: "#FFFFFF", fontSize: "18px" }}>
              Stay on top of the action with the latest news and important
              announcements on our social media channels.
            </Text>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {social.map((s) => (
              <Image src={s.image} width={40} height={40} />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            flex: 2,
            display: "flex",
            flexDirection: "row",
            gap: "30px",
            fontFamily: "Open Sans",
          }}
        >
          {sections.map((s) => (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                color: "#FFFFFF",
              }}
            >
              <Text sx={{ fontSize: "24px", fontWeight: "600" }}>
                {s.title}
              </Text>
              {s.links.map((l) => (
                <Text sx={{ fontSize: "18px", fontWeight: "400" }}>
                  {l.label}
                </Text>
              ))}
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Image src="/images/totop.svg" width={100} height={200} />
        </Box>
      </Box>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#3B3969",
          padding: "20px 100px",
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          fontFamily: "Open Sans",
          fontWeight: "400",
        }}
      >
        <Text sx={{ color: "#8E8DA0", fontSize: "16px" }}>
          @ 2022 HedgePie, All rights reserved.
        </Text>
        <Text sx={{ color: "#8E8DA0", fontSize: "16px" }}>Privacy policy</Text>
        <Text sx={{ color: "#8E8DA0", fontSize: "16px" }}>
          Terms & Conditions
        </Text>
      </Box>
    </>
  );
}

export default Footer;
