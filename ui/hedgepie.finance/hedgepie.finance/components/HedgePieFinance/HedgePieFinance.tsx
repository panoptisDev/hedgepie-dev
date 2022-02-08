import React, { ReactNode } from "react"

import { theme } from "themes/theme"

import { ThemeProvider } from "theme-ui"

import { Header } from "components/Header"
import { TitleMast } from "components/TitleMast"
// import { Footer } from "components/Footer"

type Props = { title?: string; children?: ReactNode }

const HedgePieFinance = (props: Props) => {
  const { title, children } = props
  return (
    <ThemeProvider theme={theme}>
      <Header />
      {title && <TitleMast title={title} />}
      {children}
      {/* <Footer /> */}
    </ThemeProvider>
  )
}

export default HedgePieFinance
