import React from "react"
import { Box, Button, Card, Flex, Text } from "theme-ui"

type Props = {}

const FinishedRounds = (props: Props) => {
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
            <Flex
              css={{
                alignItems: "flex-start",
                width: "100%",
                flexDirection: "column",
                gap: "30px"
              }}
            >
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
                Finished Rounds
              </Text>
              <Flex css={{ marginLeft: "50px", gap: "5rem" }}>
                <Card
                  css={{
                    backgroundColor: "#0A3F5C",
                    border: "1px solid #0A3F5C",
                    borderRadius: "25px",
                    padding: "20px"
                  }}
                >
                  <Box p={3}>
                    <Flex>
                      <Text
                        css={{
                          fontFamily: "Noto Sans",
                          fontStyle: "normal",
                          fontWeight: 600,
                          fontSize: "16px",
                          lineHeight: "150%",
                          color: "#FFFFFF"
                        }}
                      >
                        PREVIOUS ROUNDS
                      </Text>
                      <Button css={{ marginLeft: "auto" }}>View All</Button>
                    </Flex>
                  </Box>
                  <Flex css={{ gap: "10px", flexDirection: "column" }}>
                    <Card
                      css={{
                        backgroundColor: "#ffffff",
                        width: "20rem",
                        height: "fit-content",
                        borderRadius: "2rem",
                        padding: "10px"
                      }}
                    >
                      <Text
                        css={{
                          fontFamily: "Noto Sans",
                          fontStyle: "normal",
                          fontWeight: 600,
                          fontSize: "15px",
                          lineHeight: "150%",
                          color: "#16103A"
                        }}
                      >
                        Drawn September 9, 2021 @ 11.00 AM PST
                      </Text>
                    </Card>
                    <Card
                      css={{
                        backgroundColor: "#ffffff",
                        width: "20rem",
                        height: "fit-content",
                        borderRadius: "2rem",
                        padding: "10px"
                      }}
                    >
                      <Text
                        css={{
                          fontFamily: "Noto Sans",
                          fontStyle: "normal",
                          fontWeight: 600,
                          fontSize: "15px",
                          lineHeight: "150%",
                          color: "#16103A"
                        }}
                      >
                        Drawn September 9, 2021 @ 11.00 AM PST
                      </Text>
                    </Card>
                    <Card
                      css={{
                        backgroundColor: "#ffffff",
                        width: "20rem",
                        height: "fit-content",
                        borderRadius: "2rem",
                        padding: "10px"
                      }}
                    >
                      <Text
                        css={{
                          fontFamily: "Noto Sans",
                          fontStyle: "normal",
                          fontWeight: 600,
                          fontSize: "15px",
                          lineHeight: "150%",
                          color: "#16103A"
                        }}
                      >
                        Drawn September 9, 2021 @ 11.00 AM PST
                      </Text>
                    </Card>
                    <Card
                      css={{
                        backgroundColor: "#ffffff",
                        width: "20rem",
                        height: "fit-content",
                        borderRadius: "2rem",
                        padding: "10px"
                      }}
                    >
                      <Text
                        css={{
                          fontFamily: "Noto Sans",
                          fontStyle: "normal",
                          fontWeight: 600,
                          fontSize: "15px",
                          lineHeight: "150%",
                          color: "#16103A"
                        }}
                      >
                        Drawn September 9, 2021 @ 11.00 AM PST
                      </Text>
                    </Card>
                    <Card
                      css={{
                        backgroundColor: "#ffffff",
                        width: "20rem",
                        height: "fit-content",
                        borderRadius: "2rem",
                        padding: "10px"
                      }}
                    >
                      <Text
                        css={{
                          fontFamily: "Noto Sans",
                          fontStyle: "normal",
                          fontWeight: 600,
                          fontSize: "15px",
                          lineHeight: "150%",
                          color: "#16103A"
                        }}
                      >
                        Drawn September 9, 2021 @ 11.00 AM PST
                      </Text>
                    </Card>
                  </Flex>
                </Card>
                <Card
                  css={{
                    backgroundColor: "#DF4886",
                    border: "1px solid #EBE1DF",
                    borderRadius: "25px"
                  }}
                >
                  <Flex css={{ backgroundColor: "#DF4886", width: "30rem", borderRadius: "25px" }}>
                    <div
                      style={{
                        width: "5rem",
                        color: "#DF4886",
                        backgroundColor: "#FCDB8F",
                        borderBottomRightRadius: "25px",
                        fontFamily: "Poppins",
                        fontStyle: "normal",
                        fontWeight: 600,
                        fontSize: "31px",
                        lineHeight: "46px",
                        borderTopLeftRadius: "25px"
                      }}
                    >
                      265
                    </div>
                    <Text
                      css={{
                        fontFamily: "Poppins",
                        fontStyle: "normal",
                        fontWeight: 600,
                        fontSize: "31px",
                        lineHeight: "46px",
                        color: "#FFFFFF"
                      }}
                    >
                      Recent Winning Rounds
                    </Text>
                  </Flex>
                  <Flex css={{ flexDirection: "column" }}>
                    <div>Winning Ticket</div>
                    <div>YB NFT Value</div>
                    <div>Total Players</div>
                  </Flex>
                </Card>
              </Flex>
            </Flex>
          </Box>
        </Card>
      </Flex>
    </Box>
  )
}

export default FinishedRounds
