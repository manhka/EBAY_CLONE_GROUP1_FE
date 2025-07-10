import React, { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import apiInterceptor from "../services/apiInterceptor";

// Tạo AuthContext
const AuthContext = createContext(null);

// AuthProvider Component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (userId) => {
    setUser({ id: userId });
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
    console.log("User logged out or session expired.");
  };

  const handleTokenRefreshSuccess = () => {
    console.log("Token refreshed successfully! Session state updated.");
  };

  useEffect(() => {
    // Listen for auth events
    const handleAuthLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    const checkSession = async () => {
      try {
        const response = await apiInterceptor.get("/auth/check-session");
        if (response.data.isAuthenticated) {
          login(response.data.userId);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Error checking session:", error);
        logout();
      }
    };

    // Check session on component mount
    checkSession();

    // Cleanup event listener
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
