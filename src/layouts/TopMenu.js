import { useState, useEffect, useRef } from "react";
import { ChevronDown, ShoppingCart, Bell, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apiInterceptor from "../services/apiInterceptor";
import { useCart } from "../context/cartContext";
import { useAuth } from "../context/AuthContext";

function CartHoverMenu() {
  const navigate = useNavigate();
  const { cart, cartItemCount, removeFromCart } = useCart();
  const subtotal =
    cart?.items?.reduce(
      (sum, item) => sum + (item.productId?.price || 0) * item.quantity,
      0
    ) || 0;

  if (cartItemCount === 0) {
    return (
      <div className="absolute top-full right-0 w-72 bg-white rounded-lg shadow-lg border z-50 p-6 text-center">
        <h3 className="font-bold text-lg text-gray-800">Your cart is empty</h3>
        <p className="text-sm text-gray-500 mt-2">Time to start shopping!</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full right-0 w-80 bg-white rounded-lg shadow-lg z-50 p-4">
      <h3 className="font-bold text-lg text-gray-800 mb-3 px-2">Shopping cart</h3>
      <div className="max-h-64 overflow-y-auto">
        {cart.items.map(
          (item) =>
            item.productId && (
              <div
                key={item._id}
                className="flex items-center gap-3 py-2 px-2 border-t"
              >
                <img
                  src={item.productId.images?.[0]}
                  alt={item.productId.title}
                  className="w-16 h-16 object-contain rounded border"
                />
                <div className="flex-grow">
                  <p className="text-sm text-gray-800 font-semibold line-clamp-2">
                    {item.productId.title}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600">
                      SL: {item.quantity}
                    </p>
                    <p className="text-sm font-bold">
                      ${((item.productId.price || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId._id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
        )}
      </div>
      <div className="border-t mt-2 pt-3 px-2">
        <div className="flex justify-between items-center font-bold text-lg">
          <span>Total:</span>
          <span>${(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-full hover:bg-blue-700"
          >
            Checkout
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-white text-blue-600 font-bold py-2 rounded-full border-2 border-gray-300 hover:bg-gray-100"
          >
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export const getImageUrl = (avatarValue) => {
  const BACKEND_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:3000";
  if (avatarValue instanceof File) {
    return URL.createObjectURL(avatarValue);
  } else if (typeof avatarValue === "string" && avatarValue) {
    return avatarValue.startsWith("/")
      ? `${BACKEND_BASE_URL}${avatarValue}`
      : avatarValue;
  }
  return "http://bootdey.com/img/Content/avatar/avatar1.png";
};

export default function TopMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await apiInterceptor.get("/users/user-profile");
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("currentUser")),
          avatar: res.data.profile?.avatar || null,
        };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
        fetchUserProfile();
      }
    } catch (error) {
      console.error("TopMenu: Failed to parse user from localStorage", error);
      localStorage.removeItem("currentUser");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await apiInterceptor.post("/auth/logout");
    } catch (error) {
      console.error("Failed to logout from server:", error);
    } finally {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      setIsMenuOpen(false);
      navigate("/login");
    }
  };

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await apiInterceptor.get("/user-activity/activity");
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      loadNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const UserControl = () => {
    if (currentUser) {
      return (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center text-gray-500 hover:text-blue-600"
          >
            Hi,{" "}
            <span className="text-blue-600 font-semibold ml-1">
              {currentUser.username}
            </span>
            <ChevronDown
              size={16}
              className={`ml-1 transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
              <div className="flex items-center gap-3 p-4">
                <img
                  src={getImageUrl(currentUser.avatar)}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-black">
                    {currentUser.username}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentUser.email}
                  </div>
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
        Hi!{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>{" "}
        or{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          register
        </Link>
      </span>
    );
  };

  return (
    <div className="bg-white text-xs border-b">
      <div className="flex items-center justify-between max-w-[100%] mx-auto h-8 px-4">
        <ul className="flex items-center space-x-4">
          <li>
            <UserControl />
          </li>
          <li>
            <Link
              to="/daily-deals"
              className="text-gray-500 hover:text-blue-600"
            >
              Daily Deals
            </Link>
          </li>
          <li>
            <Link
              to="/brand-outlet"
              className="text-gray-500 hover:text-blue-600"
            >
              Brand Outlet
            </Link>
          </li>
          <li>
            <Link to="/help" className="text-gray-500 hover:text-blue-600">
              Help & Contact
            </Link>
          </li>
        </ul>

        <ul className="flex items-center space-x-4">
          <li>
            <Link to="/sell" className="text-gray-500 hover:text-blue-600">
              Sell
            </Link>
          </li>
          <li className="flex items-center">
            <Link to="/wishlist" className="text-gray-500 hover:text-blue-600">
              Watchlist
            </Link>
            <ChevronDown size={14} className="text-gray-500 ml-1" />
          </li>
          <li className="flex items-center">
            <Link to="/my-ebay" className="text-gray-500 hover:text-blue-600">
              My eBay
            </Link>
            <ChevronDown size={14} className="text-gray-500 ml-1" />
          </li>
          <li className="relative" ref={notifRef}>
            <button
              onClick={toggleNotifications}
              className="text-gray-500 hover:text-gray-900 p-2"
            >
              <Bell size={18} />
            </button>
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 font-bold border-b">Notifications</div>
                {loadingNotifications ? (
                  <div className="p-4 text-sm text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <li
                        key={i}
                        className="px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.message}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(n.date).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
          <li className="relative group">
            <Link
              to="/cart"
              className="relative text-gray-500 hover:text-gray-900 p-2 block"
            >
              <ShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-0 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-[9px] font-bold">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>
            <div className="hidden group-hover:block">
              <CartHoverMenu />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
