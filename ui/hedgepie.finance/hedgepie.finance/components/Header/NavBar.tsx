import React from "react"
import { ConnectWallet } from "components/ConnectWallet"
import { Flex, NavLink } from "theme-ui"
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
      <ConnectWallet />
    </Flex>
  )
}

export default NavBar
