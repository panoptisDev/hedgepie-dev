import Image from "next/image";
import React from "react";
import { Box } from "theme-ui";
import HedgePieButton from "widgets/HedgePieButton";
import HedgePieNavBar from "widgets/HedgePieNavBar";

export type PageType = "about" | "faq" | "paper" | "create" | "invest";
interface HeaderProps {
  selected: PageType;
}

function Header(props: HeaderProps) {
  const { selected } = props;
  return (
    <Box
      sx={{
        width: "100%",
        height: "5.5rem",
        backgroundColor: "#252261",
        padding: "0rem 8rem ",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Box sx={{ position: "absolute", opacity: "0.05" }}>
        <Image src="/images/hero-bg.png" height="1700" width="4000" />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "auto",
        }}
      >
        <Image src="/images/logo.svg" width={60} height={60} />
      </Box>
      <HedgePieNavBar selected={selected} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          marginLeft: "auto",
          gap: "15px",
        }}
      >
        <Box
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src="/images/language.svg" width={20} height={20} />
        </Box>
        <HedgePieButton
          bordered={true}
          label={`Start ${selected === "create" ? "Creating" : "Investing"}`}
        />
      </Box>
    </Box>
  );
}

export default Header;
