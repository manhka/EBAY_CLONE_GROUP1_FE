import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiInterceptor from '../services/apiInterceptor';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm fetchCart của bạn đã rất tốt
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data } = await apiInterceptor.get('/cart');
      setCart(data.success ? data.cart : null);
    } catch (error) {
      console.error("CartContext: Failed to fetch cart", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ✅ HÀM addToCart ĐÃ ĐƯỢC SỬA LẠI ĐỂ GỌI API
  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await apiInterceptor.post('/cart/items', { productId, quantity });
      if (data.success) {
        // Cập nhật state bằng giỏ hàng mới nhất từ server
        setCart(data.cart);
      }
      return data;
    } catch (error) {
      console.error("CartContext: Failed to add item to cart", error);
      alert(error.response?.data?.message || "Failed to add item.");
      throw error; // Ném lỗi ra để component có thể xử lý nếu cần
    }
  };

  // Các hàm update và remove của bạn đã đúng
  const updateCartItemQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    try {
      const { data } = await apiInterceptor.put(`/cart/items/${productId}`, { quantity });
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("CartContext: Failed to update quantity", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await apiInterceptor.delete(`/cart/items/${productId}`);
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("CartContext: Failed to remove item", error);
    }
  };

  // ✅ BỎ ĐI state `cartCount` và hàm `updateCartCount`

  // 3. Cung cấp các giá trị cho toàn bộ ứng dụng
  const value = {
    cart,
    isLoading,
    fetchCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    cartItemCount: cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};