import React, { useState, useEffect, useContext, createContext } from "react";
import apiInterceptor, { setAuthCallbacks } from "../services/apiInterceptor";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userId) => {
    setUser({ id: userId });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
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
          logout(); // chỉ xóa session, không redirect
        }
      } catch (error) {
        console.error("Error checking session:", error);
        logout(); // không điều hướng
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => logout();
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
