import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import apiInterceptor from "../services/apiInterceptor";

function ProductCard({ product }) {
  const {
    shippingType,
    isTopRated,
    itemsSold,
    condition,
    originalPrice
  } = product;

  return (
    <div className="w-52 flex-shrink-0">
      <Link
        to={`/product/${product._id}`}
        className="group block bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col"
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
            onClick={(e) => { e.preventDefault();}}
            className="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-red-500 transition-all"
          >
            {/* <FiHeart /> */}
          </button>
        </div>

        <div className="p-3 flex flex-col flex-grow">
          <p className="text-sm text-gray-800 line-clamp-2 mb-2 group-hover:underline">
            {product?.title}
          </p>
          <p className="text-xs text-gray-500 mb-2">{condition || 'New'}</p>
          
          <div className="mt-auto">
            <p className="text-lg font-bold">
              ${((product?.price || 0) / 100).toFixed(2)}
            </p>

            {shippingType === 'Free' && (
              <p className="text-xs text-gray-700 font-semibold mt-1">Free shipping</p>
            )}
            
            {isTopRated && (
              <p className="text-xs text-purple-700 font-bold mt-1">Top Rated Plus</p>
            )}
            
            {itemsSold > 0 && (
              <p className="text-xs text-gray-500 mt-1">{itemsSold} sold</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}


export default function SimilarProducts({ categoryId, currentProductId }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await apiInterceptor.get(`/product/category/${categoryId}`);
        const similar = res.data.filter(p => p._id !== currentProductId);
        setProducts(similar);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, currentProductId]);

  return (
    <div className="max-w-[90%] mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="font-bold text-xl">Similar Items</h2>
          <p className="text-sm text-gray-500">Sponsored</p>
        </div>
        <Link to={`/category/${categoryId}`} className="text-sm font-semibold text-blue-600 hover:underline">
          See all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 h-64">
          <Loader2 size={30} className="text-blue-400 animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 10).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6">
          No similar products found.
        </p>
      )}
    </div>
  );
}