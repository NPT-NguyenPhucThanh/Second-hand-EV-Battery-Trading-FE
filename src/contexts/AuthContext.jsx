import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser({
            role: response.data.role,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser({ role: null, isAuthenticated: false });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser({
        role: user.role,
        isAuthenticated: true,
      });
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setUser({ role: null, isAuthenticated: false });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser({ role: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};