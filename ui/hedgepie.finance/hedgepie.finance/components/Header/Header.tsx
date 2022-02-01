import React from "react"

import { theme } from "themes/theme"

import { Box, Flex, ThemeProvider, Image } from "theme-ui"

import styles from "./Header.module.css"
// import themeStyles from "./themeStyles"

import NavBar from "./NavBar"

type Props = {}

const Header = (props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Box bg="header">
        <Flex className={styles.header_wrapper}>
          <Image src={"./images/logo.png"} css={{ width: "4rem", marginLeft: "15rem" }} />
          <NavBar />
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default Header
