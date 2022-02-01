import React from "react"
import { Box, Button, Card, Flex, Text } from "theme-ui"
import { HPConnectWalletButton } from "widgets/HPConnectWalletButton"

type Props = {}

const Leaderboard = (props: Props) => {
  return (
    <Box p={3} css={{ border: "1px solid black", paddingTop: "4rem", paddingBottom: "6rem" }}>
      <Flex css={{ alignItems: "center", justifyContent: "center" }}>
        <Card
          css={{
            backgroundColor: "#FFFFFF",
            width: "70rem",
            borderRadius: "50px",
            border: "1px solid blue"
          }}
        >
          <Box p={4}>
            <Flex css={{ alignItems: "center", justifyContent: "center", width: "100%" }}>
              <Text
                css={{
                  fontFamily: "Noto Sans",
                  fontStyle: "normal",
                  fontWeight: "bold",
                  fontSize: "42px",
                  lineHeight: "100%",
                  color: "#16103A",
                  marginLeft: "50px"
                }}
              >
                Hedge Pie Leaderboard
              </Text>
              <div style={{ marginLeft: "auto" }}>
                <HPConnectWalletButton />
              </div>
            </Flex>
            <Flex css={{ alignItems: "center", justifyContent: "center" }}>
              <table
                style={{
                  borderSpacing: "50px"
                }}
              >
                <tr
                  style={{
                    fontFamily: "Noto Sans",
                    fontStyle: "normal",
                    fontWeight: 600,
                    fontSize: "15px",
                    lineHeight: "150%",
                    color: "#8E8DA0"
                  }}
                >
                  <th>YB-NFT NAME</th>
                  <th>YOUR STAKE</th>
                  <th>TOTAL STAKED</th>
                  <th>TIME LEFT</th>
                  <th></th>
                  <th></th>
                </tr>
                <tr
                  style={{
                    fontFamily: "Noto Sans",
                    fontStyle: "normal",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "150%"
                  }}
                >
                  <td style={{ color: "#16103A" }}>NFT NAME</td>
                  <td style={{ color: "#DF4886" }}>$100</td>
                  <td style={{ color: "#EFA906" }}>12</td>
                  <td style={{ color: "#16103A" }}>01:02:14</td>
                  <td>
                    <Button>View Contents</Button>
                  </td>
                  <td>
                    <Button>Stake</Button>
                  </td>
                </tr>
                <tr
                  style={{
                    fontFamily: "Noto Sans",
                    fontStyle: "normal",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "150%"
                  }}
                >
                  <td style={{ color: "#16103A" }}>NFT NAME</td>
                  <td style={{ color: "#DF4886" }}>$100</td>
                  <td style={{ color: "#EFA906" }}>12</td>
                  <td style={{ color: "#16103A" }}>01:02:14</td>
                  <td>
                    <Button>View Contents</Button>
                  </td>
                  <td>
                    <Button>Stake</Button>
                  </td>
                </tr>
                <tr
                  style={{
                    fontFamily: "Noto Sans",
                    fontStyle: "normal",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "150%"
                  }}
                >
                  <td style={{ color: "#16103A" }}>NFT NAME</td>
                  <td style={{ color: "#DF4886" }}>$100</td>
                  <td style={{ color: "#EFA906" }}>12</td>
                  <td style={{ color: "#16103A" }}>01:02:14</td>
                  <td>
                    <Button>View Contents</Button>
                  </td>
                  <td>
                    <Button>Stake</Button>
                  </td>
                </tr>
                <tr
                  style={{
                    fontFamily: "Noto Sans",
                    fontStyle: "normal",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "150%"
                  }}
                >
                  <td style={{ color: "#16103A" }}>NFT NAME</td>
                  <td style={{ color: "#DF4886" }}>$100</td>
                  <td style={{ color: "#EFA906" }}>12</td>
                  <td style={{ color: "#16103A" }}>01:02:14</td>
                  <td>
                    <Button>View Contents</Button>
                  </td>
                  <td>
                    <Button>Stake</Button>
                  </td>
                </tr>
                <tr
                  style={{
                    fontFamily: "Noto Sans",
                    fontStyle: "normal",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "150%"
                  }}
                >
                  <td style={{ color: "#16103A" }}>NFT NAME</td>
                  <td style={{ color: "#DF4886" }}>$100</td>
                  <td style={{ color: "#EFA906" }}>12</td>
                  <td style={{ color: "#16103A" }}>01:02:14</td>
                  <td>
                    <Button>View Contents</Button>
                  </td>
                  <td>
                    <Button>Stake</Button>
                  </td>
                </tr>
              </table>
            </Flex>
          </Box>
        </Card>
      </Flex>
    </Box>
  )
}

export default Leaderboard
