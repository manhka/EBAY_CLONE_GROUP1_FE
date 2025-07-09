import React, { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";
import apiInterceptor, { setAuthCallbacks } from "../services/apiInterceptor";

// Tạo AuthContext
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (userId) => {
    setUser({ id: userId });
  };

  const logout = () => {
    setUser(null);
    if (window.location.pathname !== "/login") {
      navigate("/login");
    }
    console.log("User logged out or session expired.");
  };

  const handleTokenRefreshSuccess = () => {
    console.log("Token refreshed successfully! Session state updated.");
  };

  useEffect(() => {
    setAuthCallbacks({
      onRefreshSuccess: handleTokenRefreshSuccess,
      onLogout: logout,
    });

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
    checkSession();
  }, [navigate]);
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
