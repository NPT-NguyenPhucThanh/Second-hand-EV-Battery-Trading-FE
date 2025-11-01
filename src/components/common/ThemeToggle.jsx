// src/components/common/ThemeToggle.jsx
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      shape="circle"
      onClick={toggleTheme}
      icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
      style={{ color: "var(--text-primary)" }}
    />
  );
}