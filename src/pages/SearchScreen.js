import React, { useEffect, useState, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import apiInterceptor from "../services/apiInterceptor";
import { FiGrid, FiList, FiHeart, FiShoppingCart } from 'react-icons/fi';

import TopMenu from "../layouts/TopMenu";
import MainHeader from "../layouts/Header";
import SubMenu from "../layouts/SubMenu";
import Footer from "../layouts/Footer";

// --- COMPONENT CON ĐƯỢC ĐỊNH NGHĨA TRỰC TIẾP TRONG FILE ---

const ProductCard = ({ product }) => {
  const [isWished, setIsWished] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWished(!isWished);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-white rounded-lg overflow-hidden border transition-shadow hover:shadow-lg h-full flex flex-col"
    >
      <div className="relative">
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <img
            className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105"
            src={`${product.images?.[0]}?v=${new Date(product.updatedAt).getTime()}`}
            alt={product.title}
          />
        </div>
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-red-500 transition-all"
        >
          <FiHeart className={isWished ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <p className="font-medium text-lg text-gray-900 mb-1 group-hover:underline">
          {product?.title}
        </p>
        <div className="mt-auto">
          <p className="text-lg font-bold">
            ${((product?.price || 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
};


// --- COMPONENT CHÍNH ---
export default function SearchResults() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("query") || "";
  const category = queryParams.get("category") || "0";

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("relevance");
  const [viewMode, setViewMode] = useState('grid');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isWished, setIsWished] = useState(false);
  
  const showNotificationWithTimeout = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    showNotificationWithTimeout(`${product.title} added to cart`);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWished(!isWished);
  };

  const SearchResultItem = ({ product }) => (
    <Link to={`/product/${product._id}`} key={product._id} className="block group">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 h-48 flex-shrink-0 bg-gray-100">
            <img
              src={`${product.images?.[0]}?v=${new Date(product.updatedAt).getTime()}`}
              alt={product.title}
              className="w-full h-[200px] object-cover"
            />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium text-lg text-gray-900 mb-1 group-hover:underline">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {product.description}
                </p>
              </div>
              <button
                onClick={handleWishlistClick}
                className="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-red-500 transition-all"
              >
                <FiHeart className={isWished ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-gray-900">
                  ${(product.price / 100).toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {product.quantity > 0
                    ? `${product.quantity} available`
                    : "Out of stock"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(product);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center"
              >
                <FiShoppingCart className="mr-2" size={14} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  useEffect(() => {
    setLoading(true);
    apiInterceptor.get("/products")
      .then(response => {
        setAllProducts(response.data);
      })
      .catch(error => console.error("Error fetching all products:", error))
      .finally(() => setLoading(false));
  }, []);

  const searchResults = useMemo(() => {
    let filtered = allProducts;
    if (keyword) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(keyword.toLowerCase()));
    }
    if (category && category !== "0") {
      filtered = filtered.filter(p => String(p.categoryId?._id) === category);
    }
    const sorted = [...filtered];
    if (sortOrder === "lowToHigh") sorted.sort((a, b) => a.price - b.price);
    else if (sortOrder === "highToLow") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [keyword, category, allProducts, sortOrder]);


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm">
        <div className="max-w-[95%] mx-auto">
          <TopMenu />
          <MainHeader />
          <SubMenu />
        </div>
      </div>

      <div className="max-w-[95%] mx-auto my-6 px-4">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold">Results for <span className="text-blue-600">"{keyword}"</span></h2>
          <div className='flex items-center gap-4'>
            <span className="text-sm text-gray-500">{searchResults.length} results found</span>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-3 py-1.5 text-sm bg-white">
              <option value="relevance">Sort: Best Match</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
            <div className="flex border rounded-md bg-white">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} aria-label="Grid View"><FiGrid /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 border-l ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} aria-label="List View"><FiList /></button>
            </div>
          </div>
        </div>

        <div className="bg-white p-2 sm:p-4 rounded-md border">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No products match your search.</div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 divide-y">
                {searchResults.map((product) => (
                  <SearchResultItem key={product._id} product={product} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
      <div className="mt-10 text-white">
        <div className="max-w-[95%] mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}