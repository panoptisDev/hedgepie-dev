import React from "react";
import { Box, Text, Image } from "theme-ui";
import HedgePieButton from "widgets/HedgePieButton";

const subContents: any = {
  invest: [
    {
      title: "See for yourself!",
      text: "See how individual strategies have performed over time with respect to various metrics such as APY, TVL and the number of investors participating.",
      action: "Get Started →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/create/2.svg",
      leftToRight: true,
    },
    {
      title: "DeFi at its finest",
      text: "We created HedgePie to make it easy for new investors to safely enter the DeFi space without needing to spend countless hours doing research and take on a lot of risk. Built on the Binance Smart Chain network and polygon, with more networks coming soon, the DeFi project has a multi-chain feature, all for you. This means you have access to protocols across multiple blockchains with zero added fees, all from a single portal that gives you complete visibility and access to your portfolio. ",
      action: "Get Started →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/create/5.svg",
      leftToRight: false,
    },
    {
      title: "Make it BiGGER!",
      text: "Earn more and more by using our unique feature to instantly compound all your earnings.",
      action: "Get Started →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/create/3.svg",
      leftToRight: true,
    },
    {
      title: "Opt out anytime you want, with no penalty",
      text: "Investing shouldn't be a do-or-die affair. That's why the liquidity of the investment pool is the way out for you. You can cash out from any investment strategy you try out at any time, and we will not charge any fees.",
      action: "Learn More →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/create/1.svg",
      leftToRight: false,
    },
    {
      title: "Want to build your own strategies?",
      text: "Take your investment journey to the next level by creating your own investment strategy. Join many other expert investors to manage funds and earn when others make profit from your strategy. You get all these while investing in other strategies.",
      action: "Create Strategy →",
      bordered: false,
      textBlack: false,
      image: "/images/subcontents/create/4.svg",
      leftToRight: true,
    },
  ],
  create: [
    {
      title: "One dashboard for all your needs",
      text: "Get a customized Hedgepie dashboard to keep track of all your earnings.",
      action: "Get Started →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/invest/4.svg",
      leftToRight: false,
    },
    {
      title: "Edit your preferences right away!",
      text: "Easily edit all your investment strategies in real-time with our improved dashboard. With a few clicks, you can modify your preferences and enhance your tactics.",
      action: "Start Creating →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/invest/6.svg",
      leftToRight: true,
    },
    {
      title: "DeFi at its finest",
      text: "We created HedgePie to make it easy for new investors to safely enter the DeFi space without needing to spend countless hours doing research and take on a lot of risk. Built on the Binance Smart Chain network and polygon, with more networks coming soon, the DeFi project has a multi-chain feature, all for you. This means you have access to protocols across multiple blockchains with zero added fees, all from a single portal that gives you complete visibility and access to your portfolio.",
      action: "Get Started →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/invest/1.svg",
      leftToRight: false,
    },
    {
      title: "Make it Bigger !",
      text: "Earn more and more by using our unique feature to instantly compound all your earnings.",
      action: "Get Started →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/invest/3.svg",
      leftToRight: true,
    },
    {
      title: "Create the best strategies. Top the leaderboard.",
      text: "Compiling the best of your investment strategies can earn you more than just profits with HedgePie. Create strategies and investment pools with the best APY and top the HedgePie leaderboard. Get more profits and visibility when you create the best!",
      action: "Start Creating →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/invest/5.svg",
      leftToRight: true,
    },
    {
      title: "Opt out anytime you want, with no penalty",
      text: "Investing shouldn't be a do-or-die affair. That's why the liquidity of the investment pool is the way out for you. You can cash out from any investment strategy you try out at any time, and we will not charge any fees.",
      action: "Learn More →",
      bordered: true,
      textBlack: true,
      image: "/images/subcontents/invest/2.svg",
      leftToRight: false,
    },
  ],
};

interface SubContentsProps {
  type: "create" | "invest";
}

function SubContents(props: SubContentsProps) {
  const { type } = props;
  return (
    <Box
      sx={{
        width: "100%",
        background:
          "linear-gradient(180deg, rgba(252, 143, 143, 0.1) 0%, rgba(143, 143, 252, 0.3) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "70px",
        padding: ["30px 20px", "30px 20px", "30px 20px", "70px 300px"],
      }}
    >
      {subContents[type].map((sc: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: ["column", "column", "row", "row"],
            gap: ["20px", "20px", "20px", "100px"],
            alignItems: "center",
            fontFamily: "Open Sans",
          }}
          key={sc.title}
        >
          {sc.leftToRight && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Image
                src={sc.image}
                sx={{
                  width: ["200px", "300px", "300px", "600px"],
                }}
                alt="bg"
              />
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: ["20px", "20px", "20px", "30px"],
              width: ["90%", "60%", "60%", "60rem"],
              fontFamily: "Open Sans",
            }}
          >
            <Text
              sx={{
                color: "#14114B",
                fontSize: ["24px", "24px", "28px", "32px"],
                fontWeight: "700",
              }}
            >
              {sc.title}
            </Text>
            <Text
              sx={{
                color: "#1A1A1A",
                fontSize: ["16px", "16px", "16px", "18px"],
                fontWeight: "500",
              }}
            >
              {sc.text}
            </Text>
            <Box sx={{ width: "20rem" }}>
              <HedgePieButton
                label={sc.action}
                bordered={sc.bordered}
                size="medium"
                textBlack={sc.textBlack}
                whiteBg={sc.bordered}
              />
            </Box>
          </Box>
          {!sc.leftToRight && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Image
                src={sc.image}
                sx={{
                  width: ["200px", "300px", "300px", "600px"],
                }}
                alt="bg"
              />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default SubContents;
