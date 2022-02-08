/** @jsx jsx */
/** @jsxRuntime classic */

import { ThemeProvider, jsx } from "theme-ui"

import { theme } from "themes/theme"
import Banner from "./Banner"
import Steps from "./Steps"
import DrawCountdown from "./DrawCountdown"
import Leaderboard from "./Leaderboard"
import FinishedRounds from "./FinishedRounds"
import StakeToWin from "./StakeToWin"
import CollectWinnings from "./CollectWinnings"

type Props = {}

const LandingPage = (props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Banner />
      <Steps />
      <DrawCountdown />
      <Leaderboard />
      <FinishedRounds />
      <StakeToWin />
      <CollectWinnings />
    </ThemeProvider>
  )
}

export default LandingPage
