import React from "react"

import { theme } from "themes/theme"

import { Box, Flex, Link, Text, ThemeProvider } from "theme-ui"

type Props = {}

const Footer = (props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        p={4}
        bg="header"
        css={{ clear: "both", position: "relative", bottom: 0, width: "100%" }}
      >
        <Flex>
          <Text variant="caps" sx={{ color: "header_navlink", font: "noto" }} p={2}>
            Hedge Pie
          </Text>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default Footer
