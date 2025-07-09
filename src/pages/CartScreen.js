import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Info, X } from "lucide-react";

import { useCart } from "../context/cartContext";
import { useAuth } from "../context/AuthContext";

import TopMenu from "../layouts/TopMenu";
import MainHeader from "../layouts/Header";
import SubMenu from "../layouts/SubMenu";
import Footer from "../layouts/Footer";
import DiscountCode from "../components/DiscountCode";
import apiInterceptor from '../services/apiInterceptor';

function Toast({ message }) {
  if (!message) return null;

  return (
    <div key={Date.now()} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg animate-fade-in-out z-50">
      {message}
    </div>
  );
}

function GuestEmptyCart() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-2xl font-semibold mb-2 text-gray-800">
        You don't have any items in your cart.
      </h3>
      <p className="text-gray-600 mb-8">
        Have an account?{' '}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Sign in
        </Link>
        {' '}to see your items.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate("/")}
          className="bg-white text-blue-600 font-bold px-10 py-3 rounded-full border-2 border-blue-600 hover:bg-blue-50 transition-colors"
        >
          Start shopping
        </button>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white font-bold px-10 py-3 rounded-full hover:bg-blue-700 transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

function EmptyCart() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-2xl font-semibold mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">
        Looks like you haven't added anything to your cart yet
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700"
      >
        Start Shopping
      </button>
    </div>
  );
}

function OrderSummary({ items, profile }) {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0);
  const shipping = 10.0;
  const total = subtotal + (shipping * 100);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsTooltipVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tooltipRef]);

  const shippingLocation = profile?.country || "your location";

  const fullAddress = profile
    ? `${profile.street}, ${profile.city}, ${profile.state}, ${profile.country}`
    : "Please update your profile to see the full address.";

  return (
    <div className="lg:col-span-1">
      <div className="p-6 sticky top-4 rounded-lg">
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>Items ({items.length})</span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="relative flex items-center gap-1" ref={tooltipRef}>
              <span>Shipping to {shippingLocation}</span>
              <button onClick={() => setIsTooltipVisible(!isTooltipVisible)} className="flex items-center">
                <Info size={16} className="text-gray-500 cursor-pointer" />
              </button>

              {isTooltipVisible && (
                <div className="absolute bottom-full -left-5 mb-2 w-max max-w-xs z-10">
                  {/* Thân tooltip */}
                  <div className="bg-white text-gray-800 text-sm rounded-lg p-3 shadow-lg border">
                    <div className="flex justify-between items-start gap-4">
                      <p>{fullAddress}</p>
                      <button onClick={() => setIsTooltipVisible(false)} className="text-gray-500 hover:text-gray-800 flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  {/* Mũi tên trỏ xuống */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.1))' }}></div>
                </div>
              )}
            </div>
            <span>${shipping.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t my-4" />

        <div className="flex justify-between text-xl font-bold mb-4">
          <span>Subtotal</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700 transition-colors"
        >
          Go to checkout
        </button>
      </div>
    </div>
  );

}

function CartItem({ item, showToast }) {
  const { updateCartItemQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const product = item.productId;

  if (!product) {
    return (
      <div className="border-b p-4 text-red-500 flex justify-between items-center">
        <span>Sản phẩm không tồn tại.</span>
        <button onClick={() => removeFromCart(item.productId)} className="text-blue-500 underline text-sm">Remove</button>
      </div>
    );
  }


  const handleUpdate = async (newQuantity) => {
    if (newQuantity < 1) {
      handleRemove();
      showToast('Item removed from cart');
      return;
    }
    setIsUpdating(true);
    await updateCartItemQuantity(product._id, newQuantity);
    setIsUpdating(false);
  };


  const handleRemove = async () => {
    setIsUpdating(false);
    await removeFromCart(product._id);
    showToast('Item removed from cart');
  };

  return (
    <div className="flex gap-4 pt-4 border-t first:border-t-0">
      <img src={product.images?.[0]} alt={product.title} className="w-32 h-32 object-contain rounded-lg border p-1" />
      <div className="flex-grow flex justify-between">
        <div>
          <Link to={`/product/${product._id}`} className="font-semibold text-gray-800 hover:underline line-clamp-2">{product.title}</Link>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => handleUpdate(item.quantity - 1)} disabled={isUpdating} className="p-1 border rounded-full hover:bg-gray-100 disabled:opacity-50"><Minus size={16} /></button>
            <span className="w-8 text-center font-semibold">{item.quantity}</span>
            <button onClick={() => handleUpdate(item.quantity + 1)} disabled={isUpdating || item.quantity >= product.quantity} className="p-1 border rounded-full hover:bg-gray-100 disabled:opacity-50"><Plus size={16} /></button>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg">${(product.price / 100).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
          <button onClick={handleRemove} className="text-red-500 hover:underline">Remove</button>
        </div>
      </div>
    </div>
  );
}

export default function CartScreen() {
  const { cart, isLoading } = useCart();
  const [groupedCart, setGroupedCart] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiInterceptor.get("/users/user-profile");
        setProfile(response.data.profile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    const groupAndFetchStores = async () => {
      if (!cart || !cart.items || cart.items.length === 0) {
        setGroupedCart({});
        return;
      }
      const itemsBySeller = {};
      for (const item of cart.items) {
        const sellerId = item.productId?.sellerId;
        if (sellerId) {
          if (!itemsBySeller[sellerId]) {
            itemsBySeller[sellerId] = [];
          }
          itemsBySeller[sellerId].push(item);
        }
      }
      const sellerIds = Object.keys(itemsBySeller);
      const storeFetchPromises = sellerIds.map(sellerId => {
        const representativeProductId = itemsBySeller[sellerId][0].productId._id;
        return apiInterceptor.get(`/stores/by-product/${representativeProductId}`)
          .then(response => ({ sellerId, storeInfo: response.data || { storeName: 'Unknown Store', bannerImageURL: '' } }))
          .catch(error => {
            console.error(`Failed to fetch store for seller ${sellerId}`, error);
            return { sellerId, storeInfo: { storeName: 'Unknown Store', bannerImageURL: '' } };
          });
      });
      const fetchedStores = await Promise.all(storeFetchPromises);
      const storeInfoMap = new Map(fetchedStores.map(s => [s.sellerId, s.storeInfo]));
      const finalGroupedCart = {};
      for (const sellerId of sellerIds) {
        finalGroupedCart[sellerId] = {
          storeInfo: storeInfoMap.get(sellerId),
          items: itemsBySeller[sellerId]
        };
      }

      setGroupedCart(finalGroupedCart);
    };

    groupAndFetchStores();
  }, [cart]);

  if (isLoading || (cart && !groupedCart)) {
    return <div className="flex justify-center items-center h-screen font-semibold">Loading your cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div id="MainLayout" className="bg-gray-100 min-h-screen">
        <div className="max-w-[95%] mx-auto">
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="max-w-[95%] mx-auto my-10 min-h-[400px] flex justify-center items-center bg-white rounded-lg shadow-sm">
          {user ? <EmptyCart /> : <GuestEmptyCart />}
        </div>
        <div className="mt-10 text-white">
          <div className="max-w-[95%] mx-auto">
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="MainLayout" className="bg-gray-100">
      <div className="max-w-[95%] mx-auto">
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      <div className="max-w-[90%] mx-auto my-8 min-h-[300px]">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold mb-4">Shopping cart</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-grow space-y-6">
            {Object.values(groupedCart).map((group, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={group.storeInfo.bannerImageURL}
                    alt={group.storeInfo.storeName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold">{group.storeInfo.storeName}</p>
                    <p className="text-xs text-gray-500">99.8% positive feedback</p>
                  </div>
                </div>
                {group.items.map(item => (
                  <CartItem key={item._id} item={item} showToast={showToast} />
                ))}
              </div>
            ))}
          </div>
          <div className="w-full lg:w-[320px]">
            <OrderSummary items={cart.items} profile={profile} />
          </div>
        </div>
      </div>
      <div className="mt-10 text-white">
        <div className="max-w-[95%] mx-auto">
          <Footer />
        </div>
      </div>
      <Toast message={toastMessage} />
    </div>
  );

}
