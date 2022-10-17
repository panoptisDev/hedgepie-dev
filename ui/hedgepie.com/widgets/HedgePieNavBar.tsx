import { PageType } from "components/Header";
import Image from "next/image";
import React from "react";
import { Box } from "theme-ui";

interface NavBarProps {
  selected: PageType;
}

const pages: PageType[] = ["about", "faq", "paper", "create", "invest"];

function HedgePieNavBar(props: NavBarProps) {
  const { selected } = props;

  const getPageTitle = (type: PageType) => {
    switch (type) {
      case "about":
        return "About Us";
      case "faq":
        return "FAQs";
      case "paper":
        return "White Paper";
      case "create":
        return "Create Strategies";
      case "invest":
        return "Invest";
    }
  };

  const getPageLink = (type: PageType) => {
    switch (type) {
      case "about":
        return "About Us";
      case "faq":
        return "FAQs";
      case "paper":
        return "White Paper";
      case "create":
        return "Create Strategies";
      case "invest":
        return "Invest";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "100%",
      }}
    >
      {pages.map((p) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontFamily: "Open Sans",
            backgroundColor: selected === p ? "#1799DE" : "transparent",
            color: "#FFFFFF",
            height: "100%",
            padding: "16px 32px",
            fontWeight: selected === p ? "600" : "500",
            cursor: "pointer",
            ":hover": {
              textDecoration: "underline",
              textUnderlineOffset: "10px",
            },
          }}
          onClick={() => {
            // send to page link
          }}
        >
          {getPageTitle(p)}
        </Box>
      ))}
    </Box>
  );
}

export default HedgePieNavBar;
