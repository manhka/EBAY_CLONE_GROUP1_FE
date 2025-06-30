import React, { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
// Điều chỉnh đường dẫn import này. Giả định apiInterceptor.js nằm trong thư mục 'services'
// ngang cấp với thư mục chứa AuthContext.js (ví dụ: src/contexts và src/services)
import apiInterceptor, { setAuthCallbacks } from "../services/apiInterceptor";

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
    // Set callbacks for apiInterceptor
    setAuthCallbacks({
      onRefreshSuccess: handleTokenRefreshSuccess,
      onLogout: logout,
    });

    // Optional: Check session on app load
    // This assumes you have an /auth/check-session endpoint on your backend
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
    // checkSession(); // Uncomment if you have a session check endpoint
  }, [navigate]); // navigate is a dependency as it's used inside useEffect

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
