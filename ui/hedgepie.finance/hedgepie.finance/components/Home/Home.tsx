/** @jsx jsx */
/** @jsxRuntime classic */

import { ThemeProvider, jsx } from "theme-ui"

import { theme } from "themes/theme"

import { HedgePieFinance } from "components/HedgePieFinance"
import { LandingPage } from "components/LandingPage"

type Props = {}

const Home = (props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <HedgePieFinance>
        <LandingPage />
      </HedgePieFinance>
    </ThemeProvider>
  )
}

export default Home
