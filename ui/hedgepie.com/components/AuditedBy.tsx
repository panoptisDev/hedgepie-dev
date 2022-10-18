import Image from "next/image";
import React from "react";
import { Box, Text } from "theme-ui";

function AuditedBy() {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#374B69",
        padding: "20px 100px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "50px",
      }}
    >
      <Text
        sx={{
          color: "#FFFFFF",
          letterSpacing: "8px",
          fontSize: "20px",
          fontWeight: "400",
          fontFamily: "Open Sans",
        }}
      >
        AUDITED BY
      </Text>
      <Image src="/images/auditors/consensys.svg" width={300} height={200} />
      <Image src="/images/auditors/shellboxes.svg" width={300} height={200} />
    </Box>
  );
}

export default AuditedBy;
