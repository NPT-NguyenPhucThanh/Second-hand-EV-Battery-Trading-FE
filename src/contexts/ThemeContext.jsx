import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check localStorage or default to dark mode
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true; // Default dark
  });

  // Legacy support for admin_theme
  const [theme, setTheme] = useState(
    localStorage.getItem("admin_theme") || "light"
  );

  // Sync isDark with document class and localStorage
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Modern toggle function - useCallback to stabilize reference
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
    // Also update legacy theme
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("admin_theme", newTheme);
      return newTheme;
    });
  }, []);

  const value = useMemo(() => ({
     theme, 
     isDark,
     toggleTheme 
  }), [theme, isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export useTheme hook (disable fast refresh warning)
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}