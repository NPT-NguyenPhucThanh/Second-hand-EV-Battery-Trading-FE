import React, { createContext, useState, useContext, useMemo } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  const [theme, setTheme] = useState(
    localStorage.getItem("admin_theme") || "light"
  );

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("admin_theme", newTheme);
      return newTheme;
    });
  };

  const value = useMemo(() => ({
     theme, 
     toggleTheme 
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};