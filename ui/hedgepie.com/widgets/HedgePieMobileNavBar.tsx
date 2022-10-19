import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import React from "react";
import { Box } from "theme-ui";
import { Menu as MenuIcon } from "react-feather";
import { PageType } from "components/Header";
import { useRouter } from "next/router";

const pages: PageType[] = ["about", "faq", "paper", "create", "invest"];
interface NavBarProps {
  selected: PageType;
}
function HedgePieMobileNavBar(props: NavBarProps) {
  const { selected } = props;
  const router = useRouter();
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
    <Menu
      menuButton={
        <MenuButton
          style={{
            background: "transparent",
            border: "2px solid #17DE",
            borderRadius: "8px",
            width: "2.5rem",
            height: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ background: "transparent" }}>
            <MenuIcon transform="no" style={{ color: "#1799DE" }} />
          </Box>
        </MenuButton>
      }
      menuStyle={{ zIndex: 6 }}
    >
      {pages.map((p) => (
        <MenuItem
          key={p}
          style={{
            fontFamily: "Open Sans",
            backgroundColor: p === selected ? "#17DE" : "#FFFFFF",
          }}
          onClick={() => {
            router.push(`/${p}`);
          }}
        >
          {getPageTitle(p)}
        </MenuItem>
      ))}
    </Menu>
  );
}

export default HedgePieMobileNavBar;
