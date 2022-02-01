import React from "react"
import { Box, Flex, Image, Text } from "theme-ui"
import { HPConnectWalletButton } from "widgets/HPConnectWalletButton"

type Props = {}

const Banner = (props: Props) => {
  return (
    <Box p={3} css={{ border: "1px solid black", paddingTop: "4rem", paddingBottom: "6rem" }}>
      <Flex css={{ paddingLeft: "10rem", paddingRight: "10rem" }}>
        <Flex css={{ flexDirection: "column" }}>
          <Flex
            css={{
              flexDirection: "column",
              fontSize: "96px",
              fontFamily: "Noto Sans",
              fontWeight: "800",
              lineHeight: "106px"
            }}
          >
            <Text>Stake.</Text>
            <Text>Earn. Win</Text>
          </Flex>
          <Text
            css={{
              color: "#8E8DA0",
              fontFamily: "Noto Sans",
              fontWeight: "600",
              fontSize: "25px",
              lineHeight: "40px"
            }}
          >
            Stake to earn rewards while entering for a chance to win the Jackpot!
          </Text>
          <div style={{ marginTop: "30px" }}>
            <HPConnectWalletButton />
          </div>
        </Flex>
        <Flex css={{ alignItems: "center", justifyContent: "center" }}>
          <Image src="images/pie.png" />
        </Flex>
      </Flex>
    </Box>
  )
}

export default Banner
