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
import CheckoutScreen from "./pages/CheckoutScreen";
import OrderSuccessScreen from "./pages/OrderSuccessScreen";
import OrderHistoryScreen from "./pages/OrderHistoryScreen";
import OrderDetailsScreen from "./pages/OrderDetailsScreen";
import ReturnRequestScreen from "./pages/ReturnRequestScreen";
import ReturnRequestDetailsScreen from "./pages/ReturnRequestDetailsScreen";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/cartContext";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = "AfhneoblmV1ypvz4NM1iiPCDrShBEzKIwwt_LoqfX1h5YpDoRJiRL3bo8nakvXN_3Wze76QqSrmbwTW3";

const initialPayPalOptions = {
  "client-id": PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
};

function App() {
  return (
    <PayPalScriptProvider options={initialPayPalOptions}>
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
            <Route path="/checkout" element={<CheckoutScreen />} />
            <Route path="/success" element={<OrderSuccessScreen />} />
            <Route path="/order-history" element={<OrderHistoryScreen />} />
            <Route path="/order-details/:orderId" element={<OrderDetailsScreen />} />
            <Route path="/return-requests" element={<ReturnRequestScreen />} />
            <Route path="/return-requests/:requestId" element={<ReturnRequestDetailsScreen />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  );
}

export default App;
