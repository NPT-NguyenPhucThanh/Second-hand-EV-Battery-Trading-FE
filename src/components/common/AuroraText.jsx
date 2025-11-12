import React from "react";

export const AuroraText = ({
  text,
  colors = ["#ef4444", "#f97316", "#fb923c", "#fbbf24"],
  speed = 2,
  className = "",
}) => {
  // Create gradient from colors array
  const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;

  return (
    <span
      className={`aurora-text ${className}`}
      style={{
        background: gradient,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: `aurora-flow ${speed}s linear infinite`,
        display: "inline-block",
      }}
    >
      {text}
      <style>{`
        @keyframes aurora-flow {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </span>
  );
};

export default AuroraText;
