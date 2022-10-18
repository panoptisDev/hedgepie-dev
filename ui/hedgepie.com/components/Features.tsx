import React from "react";

interface FeaturesProps {
  type: "create" | "invest";
}

const content = {
  create: [
    {
      title: "",
      text: "",
      action: "",
    },
  ],
};

function Features(props: FeaturesProps) {
  const { type } = props;
  return <div>Features</div>;
}

export default Features;
