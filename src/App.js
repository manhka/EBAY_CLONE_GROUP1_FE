import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import RegisterScreen from "./pages/RegisterScreen";
import LoginScreen from "./pages/LoginScreen";
import VerifyPinScreen from "./pages/VerifyPinScreen";
import HomePage from "./pages/HomePage";
import ProfileScreen from "./pages/ProfileScreen";
import OrderHistoryScreen from "./pages/OrderHistoryScreen";
import OrderDetailsScreen from "./pages/OrderDetailsScreen";
import ReturnRequestScreen from "./pages/ReturnRequestScreen";
import ReturnRequestDetailsScreen from "./pages/ReturnRequestDetailsScreen";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/verify-pin" element={<VerifyPinScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/order-history" element={<OrderHistoryScreen />} />
        <Route path="/order-details/:orderId" element={<OrderDetailsScreen />} />
        <Route path="/return-requests" element={<ReturnRequestScreen />} />
        <Route path="/return-requests/:requestId" element={<ReturnRequestDetailsScreen />} />
      </Routes>
    </div>
  );
}

export default App;
