import React from "react";
import { Button } from "theme-ui";

interface HedgePieButtonProps {
  label: string;
  bordered?: boolean;
  size?: "small" | "medium" | "large";
  textBlack?: boolean;
}

function HedgePieButton(props: HedgePieButtonProps) {
  const { label, bordered, size, textBlack } = props;

  const getPadding = () => {
    switch (size) {
      case "small":
        return "12px 16px";
      case "medium":
        return "16px 32px";
      case "large":
        return "32px 24px";
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return "16px";
      case "medium":
        return "20px";
      case "large":
        return "22px";
    }
  };

  const getFontWeight = () => {
    switch (size) {
      case "small":
        return "300";
      case "medium":
        return "500";
      case "large":
        return "600";
    }
  };

  return (
    <Button
      sx={{
        padding: getPadding(),
        background: bordered
          ? "transparent"
          : "linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)",
        border: bordered ? "3px solid #E98EB3" : "none",
        borderRadius: "8px",
        color: textBlack ? "#1A1A1A" : "#FFFFFF",
        fontSize: getFontSize(),
        fontWeight: getFontWeight(),
        fontFamily: "Open Sans",
        cursor: "pointer",
      }}
    >
      {label}
    </Button>
  );
}

export default HedgePieButton;
