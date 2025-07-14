import { CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiInterceptor from "../services/apiInterceptor";

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [addressDetails, setAddressDetails] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const discountTotal = location.state?.discountTotal || 0;

  const clearCart = async () => {
    try {
      await apiInterceptor.delete("/cart");
      localStorage.removeItem("cart");
      setCartItems([]);
    } catch (err) {
      console.error("Lỗi khi xóa giỏ hàng:", err);
    }
  };

  const handleBackToShop = async () => {
    navigate("/");
    await clearCart();
    window.location.reload(); 
  };

  const handleBackOrderViewHistory = async () => {
    await clearCart();
    navigate("/order-history");
    window.location.reload(); 
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlOrderId = queryParams.get("orderId");
    const stateOrderId = location.state?.orderId;

    console.log("Success Page - orderId from URL:", urlOrderId);
    console.log("Success Page - orderId from state:", stateOrderId);

    const orderId = urlOrderId || stateOrderId;

    if (!orderId) {
      setError("Không có mã đơn hàng. Đang chuyển hướng...");
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await apiInterceptor.get(`/orders/detail/${orderId}`);
        const data = response.data;

        if (!data || !data.order || !Array.isArray(data.items)) {
          throw new Error("Đơn hàng không hợp lệ");
        }

        const items = data.items.map((item) => ({
          idProduct: item.productId._id,
          title: item.productId.title,
          description: item.productId.description || "",
          price: Number(item.unitPrice || 0),
          url: item.productId.images || [],
          quantity: item.quantity,
        }));

        console.log("🖼️ Product Images:", data.items.map(i => i.productId.images));

        setCartItems(items);
        setOrderTotal(data.order.totalPrice || 0);

        const addr = data.address || {};
        setAddressDetails({
          name: addr.fullName || "N/A",
          address: addr.street || "N/A",
          city: addr.city || "N/A",
          state: addr.state || "",
          zipcode: addr.zipcode || "N/A",
          country: addr.country || "N/A",
          phone: addr.phone || "N/A",
        });
      } catch (err) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", err);
        setError("Không thể tải đơn hàng. Đang chuyển hướng...");
        setTimeout(() => navigate("/"), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location.search, location.state]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div id="SuccessPage" className="mt-12 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <div className="bg-white w-full p-6 min-h-[150px] flex flex-col items-center">
        {/* Thông báo thành công */}
        <div className="flex items-center text-xl mb-6">
          <CheckCircle className="text-green-500 h-8 w-8" />
          <span className="pl-4 font-semibold">Payment Successful</span>
        </div>

        <div className="w-full max-w-[800px]">
          {/* Thông tin hóa đơn */}
          <div className="border-b pb-4 mb-6">
            <h2 className="text-lg font-semibold">Order Confirmation</h2>
            <p className="text-sm text-gray-600">
              Thank you! We've received your payment. Here are your order details:
            </p>
          </div>

          {/* Danh sách sản phẩm (Order Summary) */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Order Summary</h3>
            {cartItems.length > 0 ? (
              <div className="border rounded-lg p-4">
                {cartItems.map((item) => (
                  <div
                    key={item.idProduct}
                    className="flex items-center justify-between border-b py-2 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.url?.[0]
                            ? item.url[0]
                            : "https://picsum.photos/100"
                        }
                        alt={item.title}
                        className="w-[60px] h-[60px] object-cover rounded"
                      />


                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
                {discountTotal > 0 && (
                  <div className="flex justify-between mt-2 text-green-600">
                    <span></span>
                    <span>You save ${(discountTotal / 100).toFixed(2)} for this deal</span>
                  </div>
                )}

                <div className="flex justify-between mt-4 pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-lg">
                    ${(getCartTotal() / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No items in your order.</p>
            )}
          </div>

          {addressDetails && Object.keys(addressDetails).length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-2">Shipping Address</h3>
              <div className="border rounded-lg p-4 text-sm">
                <p>To: {addressDetails.name}</p>
                <p>{addressDetails.address}</p>
                <p>{addressDetails.city}, {addressDetails.state}</p>
                <p>{addressDetails.country}</p>
                <p>{addressDetails.phone}</p>
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleBackToShop}
              className="bg-blue-600 text-sm font-semibold text-white p-3 rounded-full hover:bg-blue-700 px-6"
            >
              Back to Shop
            </button>
            <button
              onClick={handleBackOrderViewHistory}
              className="bg-green-600 text-sm font-semibold text-white p-3 rounded-full hover:bg-green-700 px-6"
            >
              View Order History
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-200 text-sm font-semibold text-gray-800 p-3 rounded-full hover:bg-gray-300 px-6"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}