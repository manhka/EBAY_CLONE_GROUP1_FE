import { useState, useEffect, useRef } from "react";
import { ChevronDown, ShoppingCart, Bell, X, Check, Calendar, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext";
import apiInterceptor from "../services/apiInterceptor";

// API base URL - update this to match your backend
const API_BASE_URL = "http://localhost:3000";

// Format relative time (e.g., "2 hours ago")
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Vừa xong';
  } else if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN');
  }
};

export default function TopMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        console.log("TopMenu: Restoring user from localStorage", JSON.parse(storedUser));
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("TopMenu: Failed to parse user from localStorage", error);
      localStorage.removeItem("currentUser");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

    const handleSignOut = async () => {
    try {
      await apiInterceptor.post("/auth/logout");
      console.log("Server logout successful.");
    } catch (error) {
      console.error("Failed to logout from server:", error);
    } finally {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      if (isMenuOpen) setIsMenuOpen(false);
      navigate("/login");
    }
  };

  const UserControl = () => {
    if (currentUser) {
      return (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center text-gray-500 hover:text-blue-600"
          >
            {/* Hiển thị username vì fullName không có trong model */}
            Hi, <span className="text-blue-600 font-semibold ml-1">{currentUser.username}</span>
            <ChevronDown size={16} className={`ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
              <div className="flex items-center gap-3 p-4">
                <img
                  src="http://bootdey.com/img/Content/avatar/avatar1.png"
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  {/* Hiển thị username ở cả hai nơi */}
                  <div className="font-bold text-black">{currentUser.username}</div>
                  <div className="text-sm text-gray-500">{currentUser.email}</div>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Account settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <span className="text-gray-500">
        Hi! <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link> or <Link to="/register" className="text-blue-600 hover:underline">register</Link>
      </span>
    );
  };

  return (
    <div className="bg-white text-xs border-b">
      <div className="flex items-center justify-between max-w-[100%] mx-auto h-8 px-4">
        {/* Left Side Links */}
        <ul className="flex items-center space-x-4">
          <li>
            <UserControl />
          </li>
          <li>
            <Link to="/daily-deals" className="text-gray-500 hover:text-blue-600">Daily Deals</Link>
          </li>
          <li>
            <Link to="/brand-outlet" className="text-gray-500 hover:text-blue-600">Brand Outlet</Link>
          </li>
          <li>
            <Link to="/help" className="text-gray-500 hover:text-blue-600">Help & Contact</Link>
          </li>
        </ul>

        {/* Right Side Links */}
        <ul className="flex items-center space-x-4">
          <li>
            <Link to="/sell" className="text-gray-500 hover:text-blue-600">Sell</Link>
          </li>
          <li className="flex items-center">
            <Link to="/wishlist" className="text-gray-500 hover:text-blue-600">Watchlist</Link>
            <ChevronDown size={14} className="text-gray-500 ml-1" />
          </li>
          <li className="flex items-center">
            <Link to="/my-ebay" className="text-gray-500 hover:text-blue-600">My eBay</Link>
            <ChevronDown size={14} className="text-gray-500 ml-1" />
          </li>
          <li className="relative">
            <Link to="/notifications" className="text-gray-500 hover:text-gray-900">
              <Bell size={18} />
              {/* Optional: unread count badge */}
              {/* {unreadCount > 0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] rounded-full px-1">{unreadCount}</span>} */}
            </Link>
          </li>
          <li>
            <Link to="/cart" className="text-gray-500 hover:text-gray-900">
              <ShoppingCart size={18} />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}