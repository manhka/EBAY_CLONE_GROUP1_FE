import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import RegisterScreen from "./pages/RegisterScreen";
import LoginScreen from "./pages/LoginScreen";
import VerifyPinScreen from "./pages/VerifyPinScreen";
import HomePage from "./pages/HomePage";
import ProfileScreen from "./pages/ProfileScreen";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/verify-pin" element={<VerifyPinScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Routes>
    </div>
  );
}

export default App;
