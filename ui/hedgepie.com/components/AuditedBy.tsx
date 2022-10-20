import React from "react";
import { Box, Text, Image } from "theme-ui";

function AuditedBy() {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#374B69",
        padding: ["20px 30px", "20px 30px", "20px 30px", "20px 100px"],
        display: "flex",
        flexDirection: ["column", "column", "row", "row"],
        alignItems: "center",
        justifyContent: "center",
        gap: ["30px", "30px", "30px", "50px"],
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
      <Image
        src="/images/auditors/consensys.svg"
        sx={{ width: ["200px", "200px", "200px", "300px"] }}
        alt="Consensys Logo"
      />
      <Image
        src="/images/auditors/shellboxes.svg"
        sx={{ width: ["200px", "200px", "200px", "300px"] }}
        alt="Shellboxes Logo"
      />
    </Box>
  );
}

export default AuditedBy;
