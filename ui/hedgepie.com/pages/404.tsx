import { Box, Image, Text } from "theme-ui";

export default function Custom404() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: ["column", "row", "row", "row"],
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, hsla(201, 81%, 48%, 0.15) 0%, hsla(336, 67%, 74%, 0.15) 61%)",
        gap: "30px",
      }}
    >
      <Image src="/images/logo.svg" />
      <Text
        sx={{ fontFamily: "Open Sans", fontSize: "24px", fontWeight: "600" }}
      >
        Coming Soon!
      </Text>
    </Box>
  );
}
