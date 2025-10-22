import { createContext, useContext, useState, useEffect } from "react";

import React from "react";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
