import React from "react";
import { Routes, Route } from "react-router-dom";

import RegisterScreen from "./pages/RegisterScreen";
import LoginScreen from "./pages/LoginScreen";
import VerifyPinScreen from "./pages/VerifyPinScreen";
import HomePage from "./pages/HomePage";
import ProfileScreen from "./pages/ProfileScreen";
import CartScreen from "./pages/CartScreen";
import ProductDetail from "./pages/ProductScreen";
import SearchResults from "./pages/SearchScreen";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/cartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/verify-pin" element={<VerifyPinScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
