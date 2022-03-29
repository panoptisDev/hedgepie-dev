/** @jsx jsx */
/** @jsxRuntime classic */

import { ThemeProvider, jsx } from 'theme-ui'

import { theme } from 'themes/theme'
import Banner from './Banner'
import ChoosePath from './ChoosePath'
import YBNFTInfo from './YBNFTInfo'
import Leaderboard from './Leaderboard'
import FinishedRounds from './FinishedRounds'
import CollectWinnings from './CollectWinnings'

type Props = {}

const Home = (props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Banner />
      <ChoosePath />
      <Leaderboard />
      <YBNFTInfo />
      {/* <FinishedRounds /> */}
      <CollectWinnings />
    </ThemeProvider>
  )
}

export default Home
