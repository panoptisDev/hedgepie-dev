import React from "react";
import { Button } from "theme-ui";

interface HedgePieButtonProps {
  label: string;
  bordered?: boolean;
  size?: "small" | "medium" | "large";
  textBlack?: boolean;
  whiteBg?: boolean;
}

function HedgePieButton(props: HedgePieButtonProps) {
  const { label, bordered, size, textBlack, whiteBg } = props;

  const getPadding = () => {
    switch (size) {
      case "small":
        return ["10px 12px", "10px 12px", "12px 16px", "12px 16px"];
      case "medium":
        return ["12px 16px", "12px 16px", "12px 24px", "12px 24px"];
      case "large":
        return ["12px 24px", "12px 24px", "24px 32px", "24px 32px"];
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
        background: whiteBg
          ? "#FFFFFF"
          : bordered
          ? "transparent"
          : "linear-gradient(333.11deg, #1799DE -34.19%, #E98EB3 87.94%)",
        border: bordered ? "3px solid #E98EB3" : "none",
        borderRadius: "8px",
        color: textBlack ? "#1A1A1A" : "#FFFFFF",
        fontSize: getFontSize(),
        fontWeight: getFontWeight(),
        fontFamily: "Plus Jakarta Sans",
        cursor: "pointer",
        zIndex: 1,
      }}
      onClick={() => {
        window.open("https://hedgepie.finance", "_blank");
      }}
    >
      {label}
    </Button>
  );
}

export default HedgePieButton;
