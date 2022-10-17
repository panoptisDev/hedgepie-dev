import React from "react";
import { Button } from "theme-ui";

interface HedgePieButtonProps {
  label: string;
  bordered?: boolean;
}

function HedgePieButton(props: HedgePieButtonProps) {
  const { label, bordered } = props;

  return (
    <Button
      sx={{
        padding: "12px 16px",
        background: bordered
          ? "transparent"
          : "linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)",
        border: bordered ? "3px solid #E98EB3" : "none",
        borderRadius: "8px",
        fontFamily: "Open Sans",
      }}
    >
      {label}
    </Button>
  );
}

export default HedgePieButton;
