import { ConnectWallet } from "components/ConnectWallet"
import React from "react"
import { Button, Flex, NavLink } from "theme-ui"
import { useRouter } from "next/router"

import themeStyles from "./themeStyles"

type Props = {}

const NavBar = (props: Props) => {
  const router = useRouter()
  return (
    <Flex as="nav" sx={themeStyles.nav_wrapper}>
      <NavLink
        onClick={() => {
          router.push("/vault")
        }}
        sx={themeStyles.nav}
      >
        Vaults
      </NavLink>
      <NavLink
        onClick={() => {
          router.push("/finished-lotteries")
        }}
        sx={themeStyles.nav}
      >
        View History
      </NavLink>
      <NavLink
        onClick={() => {
          router.push("/details")
        }}
        sx={themeStyles.nav}
      >
        Collections
      </NavLink>
      <ConnectWallet>
        <Button
          sx={{
            appearance: "none",
            display: "inline-block",
            textAlign: "center",
            lineHeight: "inherit",
            textDecoration: "none",
            fontSize: "inherit",
            border: "2px solid white",
            borderColor: "wallet_button_border",
            borderWidth: "3px",
            backgroundColor: "header",
            color: "wallet_button_text",
            ":hover": { cursor: "pointer", color: "#fff", borderColor: "#fff" },
            borderRadius: 40,
            width: 200,
            height: 50
          }}
        >
          Connect Wallet →
        </Button>
      </ConnectWallet>
    </Flex>
  )
}

export default NavBar
