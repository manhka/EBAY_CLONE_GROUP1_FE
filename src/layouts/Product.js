import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi"; // Import icon trái tim
import { useState } from "react";

export default function Product({ product }) {
  // Giả sử có state isWished để biết sản phẩm có trong wishlist không
  const [isWished, setIsWished] = useState(false);

  // Safely handle product id
  const productId = product?._id || product?.id;

  // Tính toán giá gốc và phần trăm giảm giá (nếu có)
  // Giả sử product có thể có trường originalPrice. Nếu không, ta tự tính toán.
  const originalPrice = product.originalPrice || product.price * 1.25;
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const renderCategory = () => {

    if (!product?.categoryId) return "Unknown";



    // If categoryId is an object with a name property

    if (typeof product.categoryId === "object" && product.categoryId !== null) {

      return product.categoryId.name || "Unknown";

    }



    return String(product.categoryId);

  };

  const handleWishlistClick = (e) => {
    e.preventDefault(); // Ngăn không cho thẻ Link điều hướng khi bấm vào nút này
    e.stopPropagation(); // Ngăn các sự kiện click khác
    setIsWished(!isWished);
    // Ở đây bạn có thể gọi API để cập nhật wishlist
    console.log("Toggled wishlist for product:", productId);
  };

  return (
    <Link
      to={`/product/${productId}`}
      className="group block bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="relative">
        {/* Image Container */}
        <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
          <img
            className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
            src={`${product.images?.[0]}?v=${new Date(product.updatedAt).getTime()}`}
            alt={product.title || "Product image"}
          />
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-red-500 transition-all"
        >
          <FiHeart className={isWished ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-3">
        <h3 className="h-12 text-sm text-gray-800 line-clamp-2 group-hover:underline cursor-pointer font-semibold">
          {product?.title || "Untitled Product"}
        </h3>

        <div className="mt-2">
          <span className="text-lg font-bold">
            ${((product?.price || 0) / 100).toFixed(2)}
          </span>

          {/* Hiển thị giá gốc và % giảm giá nếu có */}
          {discountPercent > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="line-through">${(originalPrice / 100).toFixed(2)}</span>
              <span className="font-semibold text-green-600">{discountPercent}% OFF</span>
            </div>
          )}
        </div>
        <div className="mt-1 inline-block bg-gray-200 rounded-full px-2 py-0.5 text-xs">
          Category: {renderCategory()}
        </div>
      </div>
    </Link>
  );
}