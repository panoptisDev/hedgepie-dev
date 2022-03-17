import React from "react"
import { Box, Button, Spinner } from "theme-ui"

function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}

const testData = [
  { address: '0xbe80CC729fa73A8B8e651A5546e201b4C30D4EBd', name: 'ljkad', symbol: 'ljkad', pie: '/images/pie.png', tvl: 346331, staked: 807073, participants: 12658, daily: 0.14, apy: 58.9, profit: 42646, },
  { address: '0xbe80CC729fa73A8B8e651A5546e201b4C40D4EBd', name: 'lahrt', symbol: 'lahrt', pie: '/images/pie.png', tvl: 234231, staked: 807073, participants: 12658, daily: 0.14, apy: 76.6, profit: 22866, },
  { address: '0xbe80CC729fa73A8B8e651A5546e201b4C50D4EBd', name: 'jdfmu', symbol: 'bzbad', pie: '/images/pie.png', tvl: 247431, staked: 807073, participants: 12658, daily: 0.14, apy: 43.6, profit: 82976, },
  { address: '0xbe80CC729fa73A8B8e651A5546e201b4C60D4EBd', name: 'halou', symbol: 'halou', pie: '/images/pie.png', tvl: 558431, staked: 807073, participants: 12658, daily: 0.14, apy: 54.8, profit: 42134, },
  { address: '0xbe80CC729fa73A8B8e651A5546e201b4C70D4EBd', name: 'kdape', symbol: 'bzbad', pie: '/images/pie.png', tvl: 468431, staked: 807073, participants: 12658, daily: 0.14, apy: 12.9, profit: 12446, },
]

const LotteryLoad = ({ onLoad }: any) => {

  const [newData, setNewData] = React.useState(testData)
  const [loading, setLoading] = React.useState(false)

  const handleClick = async () => {
    setLoading(true)
    await delay(1000)
    onLoad(newData)
    setNewData([])
    setLoading(false)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 200
      }}
    >
      {loading ?
        <Spinner />
        :
        <Button
          variant="info"
          sx={{
            border: '1px solid #1799DE',
            borderRadius: 40,
            padding: '18px 54px',
            cursor: 'pointer',
            transition: 'all .2s'
          }}
          onClick={handleClick}
        >
          Load More
        </Button>
      }
    </Box>
  )
}

export default LotteryLoad