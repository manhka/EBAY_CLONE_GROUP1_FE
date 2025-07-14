import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/cartContext";
import apiInterceptor from "../services/apiInterceptor";
import TopMenu from "../layouts/TopMenu";
import MainHeader from "../layouts/Header";
import SubMenu from "../layouts/SubMenu";
import Footer from "../layouts/Footer";
import { usePayPalScriptReducer, PayPalButtons } from "@paypal/react-paypal-js";
import { Tag, XCircle } from "lucide-react";

const DiscountCodeInput = ({ onApply, onRemove, appliedDiscount, sellerId, representativeProductId, items }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleApply = async () => {
        try {
            setIsLoading(true);
            const res = await apiInterceptor.post("/coupons/apply", {
                code: code.trim(),
                productId: representativeProductId,
            });
            const coupon = res.data.discount;
            console.log("Coupon from API:", coupon);
            onApply(sellerId, coupon);
        } catch (err) {
            setError(err.response?.data?.message || "Mã giảm giá không hợp lệ");
        } finally {
            setIsLoading(false);
        }
    };


    if (appliedDiscount) {
        return (
            <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-800 p-3 flex justify-between items-center rounded-r-lg">
                <div>
                    <p className="font-bold">Đã áp dụng: {appliedDiscount.code}</p>
                    <p className="text-sm">{appliedDiscount.description}</p>
                </div>
                <button onClick={() => onRemove(sellerId)} title="Gỡ bỏ mã" className="text-gray-500 hover:text-gray-800">
                    <XCircle size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="flex items-start gap-2">
                <div className="flex ">
                    <div className="relative flex items-center">
                        <Tag className="absolute left-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => { setCode(e.target.value); setError(''); }}
                            placeholder="Enter code: "
                            className={`w-60% h-10 border rounded-md pl-10 pr-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500 text-red-600' : 'border-gray-300'}`}
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
                <button
                    onClick={handleApply}
                    disabled={isLoading || !code}
                    className="bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center h-[42px]"
                >
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-300"></div> : 'Áp dụng'}
                </button>
            </div>
        </div>
    );
};


export default function CheckoutScreen() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { cart, isLoading } = useCart();
    const [profile, setProfile] = useState(null);
    const [groupedItems, setGroupedItems] = useState({});
    const [selectedShipping, setSelectedShipping] = useState("standard");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [appliedCoupons, setAppliedCoupons] = useState({});
    const [selectedShippings, setSelectedShippings] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [existingProfile, setExistingProfile] = useState(null);
    const [errors, setErrors] = useState({});
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressSelector, setShowAddressSelector] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchExistingProfile = async () => {
        try {
            const res = await apiInterceptor.get("/users/user-profile/");
            const profile = res.data?.profile;

            if (!profile || !profile._id) {
                throw new Error("Không có dữ liệu profile");
            }

            setExistingProfile(profile);
        } catch (err) {
            console.error("Không thể lấy profile hiện tại:", err);
            setExistingProfile(null);
        }
    };


    useEffect(() => {
        fetchExistingProfile();
    }, []);

    const handleSubmitNewAddress = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const values = {
            fullName: formData.get("fullName").trim(),
            phone: formData.get("phone").trim(),
            street: formData.get("street").trim(),
            city: formData.get("city").trim(),
            state: formData.get("state").trim(),
            country: formData.get("country").trim(),
        };

        const stateRegex = /^[a-zA-Z\s\-\.]+$/;
        const countryRegex = /^[a-zA-Z\s]+$/;

        const newErrors = {};
        if (values.fullName.length < 2) newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
        if (!/^\d{9,11}$/.test(values.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
        if (values.street.length < 3) newErrors.street = "Địa chỉ quá ngắn";
        if (!values.city) newErrors.city = "Vui lòng nhập thành phố";
        if (!values.state || !stateRegex.test(values.state)) {
            newErrors.state = "Tỉnh/Bang chỉ chứa chữ cái, khoảng trắng, dấu '-' và dấu '.'";
        }
        if (!values.country || !countryRegex.test(values.country)) {
            newErrors.country = "Quốc gia chỉ chứa chữ cái và khoảng trắng";
        }


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Clear errors
        setErrors({});

        const payload = {
            ...values,
            user: user._id,
            birthday: existingProfile.birthday || "2000-01-01",
            avatar: existingProfile.avatar || null,
        };

        try {
            const res = await apiInterceptor.post("/users/user-information", payload);
            const saved = res.data;
            fetchAddresses();
            setSelectedAddressId(saved._id);
            setShowAddForm(false);
            setShowAddressSelector(false);
            setProfile(saved);
        } catch (err) {
            console.error("❌ Lỗi khi thêm địa chỉ mới:", err);
            alert("Không thể thêm địa chỉ. Vui lòng thử lại.");
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await apiInterceptor.get("/users/user-addresses");
            setAddresses(res.data);
        } catch (err) {
            console.error("❌ Lỗi khi lấy danh sách địa chỉ:", err);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);



    const paymentMethods = [
        { name: 'Klarna', imgSrc: 'https://www.svgrepo.com/show/508697/klarna.svg' },
        { name: 'PayPal', imgSrc: 'https://www.svgrepo.com/show/362021/paypal-3.svg' },
        { name: 'Venmo', imgSrc: 'https://www.svgrepo.com/show/342335/venmo.svg' },
        { name: 'Google Pay', imgSrc: 'https://www.svgrepo.com/show/508690/google-pay.svg' },
        { name: 'VISA', imgSrc: 'https://www.svgrepo.com/show/508730/visa-classic.svg' },
        { name: 'Mastercard', imgSrc: 'https://www.svgrepo.com/show/508703/mastercard.svg' },
    ];

    const shippingOptions = {
        standard: { label: "Standard International Shipping", price: 1000 },
        expedited: { label: "Expedited International Shipping", price: 4500 },
    };


    useEffect(() => {
        if (cart && groupedItems) {
            const initialShippings = {};
            Object.keys(groupedItems).forEach((sellerId) => {
                const defaultMethod = Object.keys(shippingOptions)[0];
                initialShippings[sellerId] = defaultMethod;
            });
            setSelectedShippings(initialShippings);
        }
    }, [cart, groupedItems]);

    const { subtotal, totalDiscount, total, discountDetails } = useMemo(() => {
        const subtotal = cart?.items?.reduce((sum, item) => {
            const price = item?.productId?.price || 0;
            const quantity = item?.quantity || 1;
            return sum + price * quantity;
        }, 0) || 0;

        const shippingCost = Object.entries(selectedShippings || {}).reduce((sum, [sellerId, method]) => {
            const price = shippingOptions?.[method]?.price || 0;
            return sum + price;
        }, 0);

        let totalDiscount = 0;
        const discountDetails = {};

        for (const sellerId in appliedCoupons) {
            const coupon = appliedCoupons[sellerId];
            const group = groupedItems?.[sellerId];
            if (!coupon || !group) continue;

            let currentDiscount = 0;
            const couponType = coupon.discountType || "percentage";
            console.log(`Coupon for ${sellerId}:`, coupon);
            if (couponType === "shipping") {
                const shippingMethod = selectedShippings?.[sellerId];
                const shippingFee = shippingOptions?.[shippingMethod]?.price || 0;
                console.log("FREESHIP debug:", {
                    sellerId,
                    shippingFee,
                    coupon
                });

                currentDiscount = shippingFee;

            } else {
                const discountPercent = Number(coupon.discountPercent) || 0;
                const applicableProductIds = coupon.applicableProducts?.map(p => p?.$oid || p?.toString()) || [];

                const discountableItems = group.items.filter(item =>
                    applicableProductIds.length === 0 ||
                    applicableProductIds.includes(item.productId._id.toString())
                );

                for (const item of discountableItems) {
                    const itemPrice = item?.productId?.price || 0;
                    const quantity = item?.quantity || 1;
                    const itemTotal = itemPrice * quantity;

                    if (couponType === "fixed") {
                        currentDiscount += discountPercent;
                    } else if (couponType === "percentage") {
                        currentDiscount += (itemTotal * discountPercent) / 100;
                    }
                }

                // Chỉ giới hạn nếu là fixed/percentage
                const sellerSubtotal = group.items.reduce((sum, item) => {
                    const price = item?.productId?.price || 0;
                    const quantity = item?.quantity || 1;
                    return sum + price * quantity;
                }, 0);
                currentDiscount = Math.min(currentDiscount, sellerSubtotal);
            }

            discountDetails[sellerId] = Math.round(currentDiscount);
            totalDiscount += currentDiscount;
        }

        const total = subtotal + shippingCost - totalDiscount;

        return {
            subtotal: Math.round(subtotal),
            totalDiscount: Math.round(totalDiscount),
            total: Math.round(total),
            discountDetails
        };
    }, [cart, appliedCoupons, groupedItems, selectedShippings, shippingOptions]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await apiInterceptor.get("/users/user-profile");
                const data = res.data?.profile;

                if (!data._id && res.data?.profile?._id) {
                    data._id = res.data.profile._id;
                }

                console.log("✅ Profile đã fetch:", data);
                console.log("✅ profile._id (addressId):", profile?._id);

                setProfile(data);

                const updatedUser = {
                    ...JSON.parse(localStorage.getItem("currentUser")),
                    _id: data.user, // <-- lấy _id của user từ profile
                    avatar: data.avatar || null,
                };
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
            } catch (error) {
                console.error("❌ Failed to fetch user profile:", error);
            }
        };

        const groupAndFetchStores = async () => {
            if (!cart?.items || cart.items.length === 0) {
                setGroupedItems({});
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
            const storeFetchPromises = sellerIds.map((sellerId) => {
                const representativeProductId = itemsBySeller[sellerId][0].productId._id;
                return apiInterceptor
                    .get(`/stores/by-product/${representativeProductId}`)
                    .then((response) => ({
                        sellerId,
                        storeInfo: response.data || { storeName: "Unknown Store", bannerImageURL: "" },
                    }))
                    .catch((error) => {
                        console.error(`⚠️ Failed to fetch store for seller ${sellerId}`, error);
                        return { sellerId, storeInfo: { storeName: "Unknown Store", bannerImageURL: "" } };
                    });
            });

            const fetchedStores = await Promise.all(storeFetchPromises);
            const storeInfoMap = new Map(fetchedStores.map((s) => [s.sellerId, s.storeInfo]));

            const finalGroupedItems = {};
            for (const sellerId of sellerIds) {
                finalGroupedItems[sellerId] = {
                    storeInfo: storeInfoMap.get(sellerId),
                    items: itemsBySeller[sellerId],
                };
            }

            setGroupedItems(finalGroupedItems);
        };

        const stored = localStorage.getItem("currentUser");
        if (stored) {
            const parsed = JSON.parse(stored);
            setCurrentUser(parsed);
            fetchUserProfile(); // <- Gọi fetch sau khi set user
        }

        if (cart?.items) {
            groupAndFetchStores();
        }
    }, [user, cart]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0]._id);
        }
    }, [addresses]);

    const createPayPalOrder = async () => {
        if (!user) throw new Error("Vui lòng đăng nhập để thanh toán");
        if (!cart.items?.length) throw new Error("Giỏ hàng của bạn đang trống");
        if (!profile) throw new Error("Không có thông tin địa chỉ giao hàng");

        const orderItems = cart.items.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
        }));

        const response = await apiInterceptor.post("/orders/create", {
            buyerId: user._id || user.id,
            addressId: selectedAddressId,
            items: orderItems,
            shipping: selectedShippings,
            coupons: appliedCoupons,
        });

        const { paypal_order_id, approvalUrl, order_id } = response.data;

        if (!paypal_order_id || !approvalUrl) {
            throw new Error("Thiếu dữ liệu từ phản hồi");
        }

        // Lưu để dùng ở bước capture
        localStorage.setItem("pendingOrder", JSON.stringify({
            orderID: order_id,
            paypalOrderId: paypal_order_id,
            cartItems: cart.items,
            shipping: selectedShippings,
            appliedCoupons,
        }));

        return paypal_order_id;
    };
    const handleConfirm = async () => {
        try {
            const paypalOrderId = await createPayPalOrder();
            const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));
            if (!pendingOrder?.paypalOrderId) throw new Error("Không tìm thấy PayPal order");
            window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`;
        } catch (err) {
            console.error("Error:", err);
            alert(err.message || "Có lỗi xảy ra khi thanh toán");
        }
    };

    useEffect(() => {
        if (!selectedAddressId || addresses.length === 0) return;

        const selected = addresses.find((addr) => addr._id === selectedAddressId);
        if (selected) {
            setProfile(selected);
        }
    }, [selectedAddressId, addresses]);


    const handleApplyDiscountForSeller = (sellerId, discount) => {
        setAppliedCoupons(prev => ({
            ...prev,
            [sellerId]: discount
        }));
    };

    const handleRemoveDiscountForSeller = (sellerId) => {
        setAppliedCoupons(prev => {
            const newCoupons = { ...prev };
            delete newCoupons[sellerId];
            return newCoupons;
        });
    };

    return (
        <div className="bg-white text-sm">
            <div className="max-w-[95%] mx-auto">
            </div>

            <div className="max-w-[1200px] mx-auto mt-6 lg:flex-row justify-between gap-8">
                {/* LEFT SIDE */}
                <h1 className="text-3xl font-semibold mb-4 flex items-center">
                    <a href="/" className="flex-shrink-0">
                        <img width="120" src="/images/logo.svg" alt="Logo" />
                    </a>
                    <span className="font-bold pl-3">Checkout</span>
                </h1>
                <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-md mb-6 flex items-center gap-3">
                    <img src="https://www.svgrepo.com/show/362021/paypal-3.svg" alt="PayPal" className="h-6" />
                    <span>Buy with PayPal. It's fast and simple.</span>
                </div>
                {/* Pay with */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-[65%]">
                        <div className="mb-6 border-b border-gray-300">
                            <h2 className="text-2xl font-bold mb-2">Pay with</h2>
                            <div className="flex flex-col gap-3 pl-5 mb-6">
                                {paymentMethods.map((method) => (
                                    <div key={method.name} className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={method.name.toLowerCase()}
                                                checked={selectedPayment === method.name.toLowerCase()}
                                                onChange={(e) => setSelectedPayment(e.target.value)}
                                                className="h-5 w-5"
                                            />
                                            <img
                                                src={method.imgSrc}
                                                alt={method.name}
                                                className="h-10 w-12 border border-black"
                                            />
                                            {method.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Ship to */}
                        <div className="mt-6 border-b border-gray-300 pb-6">
                            <h2 className="text-2xl font-bold mb-2">Ship to</h2>

                            {/* Địa chỉ đang dùng */}
                            {profile ? (
                                <div className="leading-relaxed mb-2">
                                    <p>{profile.fullName || "Chưa có tên"}</p>
                                    <p>
                                        {profile.street || ""}, {profile.city || ""} {profile.zipcode || ""}
                                    </p>
                                    <p>{profile.country || ""}</p>
                                    <p>{profile.phone || "Chưa có số điện thoại"}</p>
                                </div>
                            ) : (
                                <div className="text-gray-500">No address available</div>
                            )}

                            {/* Nút Change */}
                            <button
                                onClick={() => {
                                    setShowAddressSelector(!showAddressSelector);
                                    if (!showAddressSelector) fetchAddresses();
                                }}
                                className="text-blue-600 underline mt-1 inline-block"
                            >
                                Change
                            </button>

                            {/* Danh sách địa chỉ dạng radio */}
                            {showAddressSelector && (
                                <div className="border p-4 rounded mt-4 bg-gray-50">
                                    <h3 className="font-semibold mb-2">Select shipping address</h3>
                                    {addresses.length > 0 ? (
                                        addresses.map((addr) => (
                                            <label key={addr._id} className="block mb-2">
                                                <input
                                                    type="radio"
                                                    name="selectedAddress"
                                                    value={addr._id}
                                                    checked={selectedAddressId === addr._id}
                                                    onChange={() => setSelectedAddressId(addr._id)}
                                                    className="mr-2"
                                                />
                                                {addr.fullName}, {addr.street}, {addr.city}, {addr.country}, PhoneNum: {addr.phone}
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">Bạn chưa có địa chỉ nào</p>
                                    )}

                                    {/* Nút Thêm địa chỉ */}
                                    <button
                                        onClick={() => {
                                            setShowAddForm(true);
                                            fetchExistingProfile();
                                        }}
                                        className="text-sm text-blue-500 mt-2 underline"
                                    >
                                        + Add new address
                                    </button>
                                </div>
                            )}

                            {/* Form thêm địa chỉ mới */}
                            {showAddForm && (
                                <div className="mt-4 border p-4 rounded bg-gray-50 relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-lg font-bold"
                                        title="Đóng"
                                    >
                                        <XCircle size={20} />
                                    </button>

                                    <h3 className="font-semibold mb-2">Add new address</h3>

                                    <form onSubmit={handleSubmitNewAddress} className="space-y-3">
                                        {[
                                            { name: "fullName", placeholder: "Họ tên" },
                                            { name: "phone", placeholder: "Số điện thoại" },
                                            { name: "street", placeholder: "Street" },
                                            { name: "city", placeholder: "City" },
                                            { name: "state", placeholder: "State" },
                                            { name: "country", placeholder: "Country" },
                                        ].map((field) => (
                                            <div key={field.name}>
                                                <input
                                                    type="text"
                                                    name={field.name}
                                                    placeholder={field.placeholder}
                                                    className={`w-full p-2 border rounded ${errors[field.name] ? "border-red-500" : "border-gray-300"
                                                        }`}
                                                />
                                                {errors[field.name] && (
                                                    <p className="text-sm text-red-600 mt-1">{errors[field.name]}</p>
                                                )}
                                            </div>
                                        ))}

                                        <button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                                        >
                                            Lưu địa chỉ
                                        </button>
                                    </form>
                                </div>
                            )}

                        </div>

                        {/* Review order */}
                        <div className="mt-8 border-b border-gray-300">
                            <h2 className="text-2xl font-bold mb-3">Review order</h2>
                            {Object.entries(groupedItems).map(([sellerId, group]) => (
                                <div key={sellerId} className="mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={group.storeInfo?.bannerImageURL || "https://picsum.photos/40"}
                                            alt={group.storeInfo?.storeName || "Store"}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-bold">{group.storeInfo?.storeName || "Unknown Store"}</p>
                                            <p className="text-xs text-gray-500">99.8% positive feedback</p>
                                        </div>
                                    </div>

                                    {group.items?.map((item) => (
                                        <div key={item._id} className="flex border-b py-4 gap-4">
                                            <img
                                                src={item.productId?.images?.[0] || "https://picsum.photos/100"}
                                                className="w-20 h-20 object-cover border rounded"
                                                alt={item.productId?.title || "Product"}
                                            />
                                            <div className="flex flex-col justify-between flex-grow">
                                                <div>
                                                    <h3 className="font-semibold text-sm">
                                                        {item.productId?.title || "Unnamed Product"}
                                                    </h3>
                                                    <p className="text-gray-500 text-xs">Quantity: {item.quantity}</p>
                                                    <p className="font-bold mt-1">
                                                        {item.productId?.price !== undefined
                                                            ? `$${(item.productId.price / 100).toFixed(2)}`
                                                            : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-6">
                                        <h2 className="text-2xl font-bold mb-2">Gift cards and coupons</h2>
                                        <p className="text-sm text-gray-600 mb-4">Apply coupons or add eBay gift cards to your account. Once added, gift cards can't be removed.</p>
                                    </div>
                                    {group.items?.[0]?.productId && (
                                        <DiscountCodeInput
                                            sellerId={sellerId}
                                            representativeProductId={group.items[0].productId._id}
                                            appliedDiscount={appliedCoupons[sellerId]}
                                            onApply={handleApplyDiscountForSeller}
                                            onRemove={handleRemoveDiscountForSeller}
                                            items={group.items}
                                        />
                                    )}

                                    {/* Delivery options */}
                                    <div className="mt-6 border-b border-gray-300 pb-6">
                                        <h4 className="font-semibold mb-2">Delivery</h4>
                                        <div className="flex flex-col gap-2 mb-6">
                                            {Object.entries(shippingOptions).map(([key, value]) => (
                                                <label key={key} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`shipping-${sellerId}`}
                                                        value={key}
                                                        checked={selectedShippings[sellerId] === key}
                                                        onChange={() =>
                                                            setSelectedShippings(prev => ({
                                                                ...prev,
                                                                [sellerId]: key
                                                            }))
                                                        }
                                                    />
                                                    {value.label} - ${(value.price / 100).toFixed(2)}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE - ORDER SUMMARY */}
                    <div className="w-full lg:w-[35%] sticky top-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="font-bold text-2xl mb-4 border-b pb-3">Order Summary</h2>

                            <div className="space-y-2 text-gray-700 text-sm">
                                <div className="flex justify-between">
                                    <span>Items ({cart?.items?.length || 0})</span>
                                    <span>${(subtotal / 100).toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>
                                        ${(
                                            Object.entries(selectedShippings).reduce((total, [sellerId, option]) => {
                                                return total + (shippingOptions[option]?.price || 0);
                                            }, 0) / 100
                                        ).toFixed(2)}
                                    </span>
                                </div>

                                {Object.entries(discountDetails).map(([sellerId, amount]) => (
                                    <div key={sellerId} className="flex justify-between text-green-600 font-medium">
                                        <span>Coupon {appliedCoupons[sellerId]?.code}</span>
                                        <span>- ${(amount / 100).toFixed(2)}</span>
                                    </div>
                                ))}

                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-green-700 font-semibold border-t border-gray-200 pt-3">
                                        <span>Discounts Total</span>
                                        <span>- ${(totalDiscount / 100).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-300 mt-4 pt-4 font-bold text-lg flex justify-between">
                                <span>Order total</span>
                                <span>${(total / 100).toFixed(2)}</span>
                            </div>

                            <div className="text-xs text-gray-500 mt-4 leading-relaxed">
                                With this purchase you agree to the{" "}
                                <a href="#" className="text-blue-600 underline">
                                    eBay International Shipping terms and conditions
                                </a>.
                            </div>

                            {selectedPayment === "paypal" ? (
                                <PayPalButtons
                                    style={{ layout: "horizontal" }}
                                    forceReRender={[total, selectedShippings, appliedCoupons]}
                                    createOrder={async () => {
                                        const paypalOrderId = await createPayPalOrder();
                                        return paypalOrderId;
                                    }}
                                    onApprove={async (data) => {
                                        try {
                                            const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));
                                            if (!pendingOrder?.paypalOrderId) throw new Error("Không tìm thấy thông tin đơn hàng");

                                            const response = await apiInterceptor.post("/orders/success", {
                                                token: pendingOrder.paypalOrderId,
                                                PayerID: data.payerID,
                                            });

                                            await apiInterceptor.delete("/cart"); // xóa giỏ hàng user
                                            localStorage.removeItem("pendingOrder");

                                            navigate("/success", {
                                                state: {
                                                    orderId: response.data.orderId,
                                                    discountTotal: totalDiscount,
                                                    cartItems: pendingOrder.cartItems,
                                                    total,
                                                    shipping: pendingOrder.shipping,
                                                    coupons: pendingOrder.appliedCoupons
                                                }
                                            });
                                        } catch (err) {
                                            console.error("Lỗi khi xác nhận đơn hàng:", err);
                                            alert(err.message || "Thanh toán thất bại");
                                        }
                                    }}
                                    onError={(err) => {
                                        console.error("Lỗi PayPal:", err);
                                        alert("Thanh toán thất bại. Vui lòng thử lại.");
                                    }}
                                />

                            ) : (
                                <button
                                    className="w-full bg-blue-600 text-white rounded-full py-3"
                                >
                                    Confirm and Pay
                                </button>
                            )}



                            <div className="mt-4 text-sm text-center text-gray-600 flex items-center justify-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-blue-600"
                                >
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                                <span className="font-semibold">
                                    Purchase protected by{" "}
                                    <a href="#" className="text-blue-600 underline">
                                        eBay Money Back Guarantee
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-10 text-white">
                <div className="max-w-[95%] mx-auto">
                </div>
            </div>
        </div>
    );
}