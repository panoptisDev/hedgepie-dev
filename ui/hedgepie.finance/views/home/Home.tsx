/** @jsx jsx */
/** @jsxRuntime classic */

import { ThemeProvider, jsx } from 'theme-ui'

import { theme } from 'themes/theme'
import Banner from './Banner'
import ChoosePath from './ChoosePath'
import YBNFTInfo from './YBNFTInfo'
import Leaderboard from './Leaderboard'
import CollectWinnings from './CollectWinnings'
import DemoInfo from './DemoInfo'

type Props = {}

const Home = (props: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Banner />
      <ChoosePath />
      {/* <Leaderboard /> */}
      <DemoInfo />
      {/* {/* <YBNFTInfo /> */}
      <CollectWinnings />
    </ThemeProvider>
  )
}

export default Home
