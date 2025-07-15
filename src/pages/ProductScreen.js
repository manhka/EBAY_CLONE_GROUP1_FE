import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiChevronRight, FiHeart, FiShare2, FiZoomIn, FiHelpCircle, FiCheckCircle, FiClock, FiPrinter, FiFlag, FiShoppingCart } from 'react-icons/fi';

import TopMenu from "../layouts/TopMenu";
import MainHeader from "../layouts/Header";
import SubMenu from "../layouts/SubMenu";
import Footer from "../layouts/Footer";
import SimilarProducts from "../components/SimilarProduct";
import ReviewSection from "../components/ReviewSection";
// import CommentSection from "../../../components/CommentSection";
// import DiscountCode from "../../../components/DiscountCode";
import AddedToCartModal from "../components/AddedToCartModal";
import apiInterceptor from "../services/apiInterceptor";
// Import components

const ProductImageGallery = ({ images, title }) => {
  const [mainImage, setMainImage] = useState(images?.[0] || '/placeholder.jpg');

  useEffect(() => {
    setMainImage(images?.[0] || '/placeholder.jpg');
  }, [images]);

  return (
    <div className="flex flex-row gap-2">
      {/* Cột thumbnail dọc */}
      <div className="flex flex-col gap-2">
        {images?.map((img, index) => (
          <button
            key={index}
            className={`w-20 h-20 border-2 rounded-md overflow-hidden ${mainImage === img ? 'border-blue-500' : 'border-gray-200'}`}
            onMouseEnter={() => setMainImage(img)}
          >
            <img src={img} alt={`${title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Ảnh chính */}
      <div className="relative flex-1">
        <img src={mainImage} alt={title} className="w-full h-auto max-h-[450px] object-contain" />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white">
            <FiZoomIn size={20} />
          </button>
          <button className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white">
            <FiHeart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const PurchaseActions = ({
  product,
  quantity,
  setQuantity,
  handleCartAction,
  handleWishlistAction,
  isItemAdded,
  isWishlist,
  isLoading,
  handleBuyNow
}) => {
  return (
    <div className="rounded-lg p-4">
      <div className="mb-4">
        <p className="text-3xl font-bold">US ${((product.price || 0) / 100).toFixed(2)}</p>
      </div>

      <div className="mb-4">
        <label htmlFor="quantity-input" className="text-sm font-semibold text-gray-600">Quantity:</label>
        <div className='flex items-center gap-2'>
          <input type="number" id="quantity-input" defaultValue="1" min="1" max={product.quantity} className="mt-1 block w-20 p-2 border border-gray-400 rounded-md" />
          <span className='text-sm text-gray-500'>{product.quantity} available</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={handleBuyNow} className="w-full bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700">
          Buy It Now
        </button>
        <button
          onClick={handleCartAction}
          disabled={isLoading}
          className={`
      w-full font-bold py-3 rounded-full border-2 flex items-center justify-center
      transition-colors duration-200
      ${isItemAdded
              ? 'bg-white text-red-600 border-red-600 hover:bg-red-50'
              : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
            }
      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
    `}
        >{isLoading
          ? 'Processing...'
          : isItemAdded
            ? 'Remove from Cart'
            : 'Add to Cart'
          }
        </button>

        <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-full border-2 border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2">
          <FiHeart /> Add to Watchlist
        </button>
      </div>
      <div className='flex items-center mt-4 text-sm'>
        <FiCheckCircle className="text-green-500 mr-2" />
        <span>Breathe easy. Returns accepted.</span>
      </div>
    </div>
  );
};


export default function ProductScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemAdded, setIsItemAdded] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [store, setStore] = useState(null);
  const [isCartModalVisible, setCartModalVisible] = useState(false);

  const paymentMethods = [
    { name: 'Klarna', imgSrc: 'https://www.svgrepo.com/show/508697/klarna.svg' },
    { name: 'PayPal', imgSrc: 'https://www.svgrepo.com/show/362021/paypal-3.svg' },
    { name: 'Venmo', imgSrc: 'https://www.svgrepo.com/show/342335/venmo.svg' },
    { name: 'Google Pay', imgSrc: 'https://www.svgrepo.com/show/508690/google-pay.svg' },
    { name: 'VISA', imgSrc: 'https://www.svgrepo.com/show/508730/visa-classic.svg' },
    { name: 'Mastercard', imgSrc: 'https://www.svgrepo.com/show/508703/mastercard.svg' },
  ];

  // Check if product is in cart
  const checkItemInCart = async () => {
    if (!currentUser) return false;
    try {
      const { data } = await apiInterceptor.get('/cart');
      if (!data.success || !data.cart) return false;
      return data.cart.items?.some(item => item.productId?._id === id) || false;
    } catch (error) {
      console.error("Error checking cart:", error);
      return false;
    }
  };

  // Check if product is in wishlist
  const checkItemInWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    return wishlist.some((item) => item.id === id);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProductAndCartStatus = async () => {
      // Nếu không có id, không làm gì cả
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await apiInterceptor.get(`/products/${id}`);
        const { product, store } = response.data;
        setProduct(product);
        setStore(store);
        const inCart = await checkItemInCart();
        setIsItemAdded(inCart);
        setIsWishlist(checkItemInWishlist());
        if (product?.isAuction) {
          const bidsResponse = await apiInterceptor.get(`/auctionBids?productId=${id}`);
          setBidHistory(
            bidsResponse.data.sort((a, b) => new Date(b.bidDate) - new Date(a.bidDate))
          );
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        // setError("Could not load product details."); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndCartStatus();
  }, [id, currentUser?._id]);

  const handleBuyNow = async () => {
    if (!currentUser) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    try {
      const tempOrder = {
        items: [
          {
            productId: id,
            quantity: 1
          },
        ],
        isBuyNow: true,
      };

      localStorage.setItem("buyNowOrder", JSON.stringify(tempOrder));

      navigate("/checkout");
    } catch (error) {
      console.error("Buy Now Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };


  // Handle cart actions (add/remove)
  const handleCartAction = async () => {
    if (!currentUser) {
      alert("Please login to manage your cart");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      if (isItemAdded) {
        // REMOVE FROM CART
        await apiInterceptor.delete(`/cart/items/${id}`);
        setIsItemAdded(false);
        alert("Item removed from cart");
      } else {
        // ADD TO CART
        await apiInterceptor.post('/cart/items', {
          productId: id,
          quantity: quantity
        });
        setIsItemAdded(true);
        setCartModalVisible(true);
      }
    } catch (error) {
      console.error("💥 FULL CART ACTION ERROR:", error);
      if (error.response) {
        alert(error.response.data.message || "Lỗi từ server, vui lòng thử lại.");
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("Lỗi mạng. Vui lòng kiểm tra kết nối và đảm bảo server backend đang chạy.");
      } else {
        console.error("Error setting up request:", error.message);
        alert("Đã có lỗi xảy ra khi gửi yêu cầu.");
      }
    } finally {
      setIsLoading(false);
    }
  };



  const toggleWishlist = async () => {
    if (!product) return; // Đảm bảo có thông tin sản phẩm

    try {
      if (isWishlist) {
        await apiInterceptor.delete(`/wishlist/${product._id}`);
        setIsWishlist(false);
        alert("Removed from wishlist");
      } else {
        await apiInterceptor.post('/wishlist', { productId: product._id });
        setIsWishlist(true);
        alert("Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert(error.response?.data?.message || "Failed to update wishlist.");
    }
  };

  const handleApplyDiscount = (discount) => {
    setAppliedDiscount(discount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-[95%] mx-auto">
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
        <div className="max-w-[95%] mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-[95%] mx-auto">
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>

        <div className="max-w-[95%] mx-auto px-4 py-16">
          <div className="bg-white p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm text-white bg-[#0053A0] hover:bg-[#00438A]"
            >
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[95%] mx-auto">
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      <main className="max-w-[95%] mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-2 text-xs" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1">
            <li>
              <Link
                to="/"
                className="text-[#555555] hover:text-[#0053A0] hover:underline"
              >
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <FiChevronRight className="h-3 w-3 text-gray-400 mx-1" />
              <Link
                to={`/list-category/${product.categoryId}`}
                className="text-[#555555] hover:text-[#0053A0] hover:underline"
              >
                {product.categoryName || "Category"}
              </Link>
            </li>
            <li className="flex items-center">
              <FiChevronRight className="h-3 w-3 text-gray-400 mx-1" />
              <span className="text-[#555555]">{product.title}</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white">
          <div className="lg:flex">
            {/* Left Column - Images */}
            <div className="lg:w-[60%] p-2 lg:p-4 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="relative lg:col-span-7">
                <ProductImageGallery images={product.images} title={product.title} />
              </div>

              {/* Image actions */}
              <div className="flex justify-center mt-4 text-xs text-[#0053A0]">
                <button className="flex items-center hover:underline mx-2">
                  <FiShare2 className="mr-1 h-3 w-3" />
                  Share
                </button>
              </div>

              <div className="mt-6">
                <SimilarProducts categoryId={product.categoryId._id} />
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="lg:w-[40%] p-2 lg:p-4">
              <div className="border-b border-gray-200 pb-2">
                <div className='mb-4'>
                  <h1 className="text-2xl md:text-3xl font-bold pl-5">{product.description}</h1>
                </div>
                {store && (
                  <div className="mt-4 mb-4 pl-5 pt-3 pb-3 rounded-lg border-b border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-4">
                      {/* Store Avatar/Logo */}
                      <div className="w-12 h-12 flex-shrink-0">
                        <img
                          src={store.bannerImageURL}
                          alt={store.storeName}
                          className="w-full h-full rounded-full object-cover border border-gray-300 cursor-pointer"
                        />
                      </div>
                      {/* Store Info */}
                      <div className="flex-grow">
                        <p className="font-bold hover:underline cursor-pointer">
                          {store.storeName}
                        </p>
                        <div className="text-xs text-gray-600 mt-1">
                          <span>99.4% positive</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="hover:underline cursor-pointer">Seller's other items</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="hover:underline cursor-pointer">Contact seller</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <span className="text-[#0053A0] hover:underline cursor-pointer pl-5">
                    Brand New
                  </span>
                  <span className="mx-1">|</span>
                  <span>
                    Condition: <span className="font-medium">New</span>
                  </span>
                </div>
              </div>

              {/* Auction or Buy Now Section */}
              <div className="lg:col-span-3">
                <PurchaseActions
                  product={product}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  handleCartAction={handleCartAction}
                  toggleWishlist={toggleWishlist}
                  isItemAdded={isItemAdded}
                  isWishlist={isWishlist}
                  handleBuyNow={handleBuyNow}
                />
              </div>

              {/* Shipping & Payment */}
              <div className="py-4 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-medium">Shipping</h3>
                      <button
                        onClick={() => setShowShipping(!showShipping)}
                        className="text-xs text-[#0053A0]"
                      >
                        {showShipping ? "Hide" : "Show"} details
                      </button>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Item location:</span>
                        <span>London, United Kingdom</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Shipping to:</span>
                        <span>United Kingdom</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Delivery:</span>
                        <span className="text-green-600 font-medium">
                          Free Standard Delivery
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Estimated between:</span>
                        <span>Wed, 15 Jun and Mon, 20 Jun</span>
                      </div>
                    </div>

                    {showShipping && (
                      <div className="mt-3 text-xs bg-gray-50 p-3 border border-gray-200">
                        <table className="w-full">
                          <thead className="text-gray-500">
                            <tr>
                              <th className="text-left py-1">Service</th>
                              <th className="text-right py-1">Delivery*</th>
                              <th className="text-right py-1">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-1">Standard Delivery</td>
                              <td className="text-right py-1">
                                3-5 business days
                              </td>
                              <td className="text-right py-1 font-medium">
                                Free
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1">Express Delivery</td>
                              <td className="text-right py-1">
                                1-2 business days
                              </td>
                              <td className="text-right py-1">£4.99</td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="mt-2">* Estimated delivery times</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-2">Payments</h3>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-wrap gap-2">
                        {/* Dùng map để render các icon từ mảng dữ liệu */}
                        {paymentMethods.map(method => (
                          <div
                            key={method.name}
                            className={`flex items-center justify-center border border-black-300 rounded-md ${method.customClass || ''}`}
                          >
                            <img
                              src={method.imgSrc}
                              alt={method.name}
                              className="h-10 w-12"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Returns */}
              <div className="py-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium">Returns</h3>
                  <button
                    onClick={() => setShowReturns(!showReturns)}
                    className="text-xs text-[#0053A0]"
                  >
                    {showReturns ? "Hide" : "Show"} details
                  </button>
                </div>
                <div className="text-sm">
                  <p>30 day returns. Buyer pays for return shipping.</p>
                </div>

                {showReturns && (
                  <div className="mt-3 text-xs bg-gray-50 p-3 border border-gray-200">
                    <p className="font-medium">Return policy details:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>
                        Returns accepted within 30 days after the buyer receives
                        the item
                      </li>
                      <li>Buyer pays for return shipping</li>
                      <li>Item must be returned in original condition</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium">Description</h3>
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="text-xs text-[#0053A0]"
                  >
                    {showDescription ? "Hide" : "Show"} details
                  </button>
                </div>
                <div className="text-sm">
                  <p className="line-clamp-3">{product.description}</p>
                </div>

                {showDescription && (
                  <div className="mt-3 text-sm">
                    <p>{product.description}</p>
                    <div className="mt-4">
                      <h4 className="font-medium">Product Specifications:</h4>
                      <table className="w-full mt-2 text-xs">
                        <tbody>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">Brand</td>
                            <td className="py-2">Premium Brand</td>
                          </tr>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">Model</td>
                            <td className="py-2">2023 Edition</td>
                          </tr>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">Color</td>
                            <td className="py-2">Black</td>
                          </tr>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">
                              Material
                            </td>
                            <td className="py-2">Premium Quality</td>
                          </tr>
                          <tr className="border-t border-gray-200">
                            <td className="py-2 w-1/3 text-gray-500">
                              Dimensions
                            </td>
                            <td className="py-2">30 x 20 x 10 cm</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>


              {!currentUser && (
                <div className="mt-4 bg-blue-50 border border-blue-200 p-3 text-sm">
                  <p className="text-blue-700">
                    Please{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="font-medium text-[#0053A0] underline"
                    >
                      sign in
                    </button>{" "}
                    to{" "}
                    {product.isAuction
                      ? "buy"
                      : "add items to basket"}
                  </p>
                </div>
              )}

              {/* Add DiscountCode component before the cart buttons */}
              {/* <DiscountCode
                onApplyDiscount={handleApplyDiscount}
                productId={id}
              /> */}
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="mt-6">
          <ReviewSection productId={id} />
        </div>

        {/* Similar Products Section */}
      </main>

      <div className="mt-10 text-white">
        <div className="max-w-[95%] mx-auto">
          <Footer />
        </div>
      </div>
      <AddedToCartModal
        visible={isCartModalVisible}
        onClose={() => setCartModalVisible(false)}
        product={product}
      />
    </div>
  );
}
