import Image from "next/image";
import React from "react";
import { Box, Text } from "theme-ui";

interface StrategyListProps {
  textLine1?: string;
  textLine2?: string;
}

const strategies = [
  { title: "Compound Finance", image: "/images/strategies/compound.svg" },
  { title: "PanCake Swap", image: "/images/strategies/pancakeswap.svg" },
  { title: "Aave Finance", image: "/images/strategies/aave.svg" },
  { title: "Near Protocol", image: "/images/strategies/near.svg" },
  { title: "UniSwap", image: "/images/strategies/uniswap.svg" },
  { title: "Balancer", image: "/images/strategies/balancer.svg" },
  { title: "Polygon", image: "/images/strategies/polygon.svg" },
];

function StrategyList(props: StrategyListProps) {
  const { textLine1, textLine2 } = props;
  return (
    <Box
      sx={{
        jwidth: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        gap: "50px",
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {textLine1 && (
          <Text
            sx={{
              fontFamily: "Open Sans",
              fontSize: "24px",
              fontWeight: "500",
              color: "#000000",
            }}
          >
            {textLine1}
          </Text>
        )}
        {textLine2 && (
          <Text
            sx={{
              fontFamily: "Open Sans",
              fontSize: "24px",
              fontWeight: "500",
              color: "#000000",
            }}
          >
            {textLine2}
          </Text>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          justifyContent: "center",
          gap: "70px",
        }}
      >
        {strategies.map((s) => (
          <Image src={s.image} width={80} height={80} />
        ))}
      </Box>
    </Box>
  );
}

export default StrategyList;
