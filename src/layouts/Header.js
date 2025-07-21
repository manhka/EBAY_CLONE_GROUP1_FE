import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiInterceptor from "../services/apiInterceptor";

function MainHeader() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("0");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    apiInterceptor.get("/categories").then(res => setCategories(res.data)).catch(err => console.error("Error fetching categories:", err));
    apiInterceptor.get("/products").then(res => setProducts(res.data)).catch(err => console.error("Error fetching products:", err));
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    return products
      .filter((product) => product.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 10);
  }, [products, searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsDropdownOpen(false);
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}&category=${selectedCategory}`);
    }
  };

  const handleSuggestionClick = (suggestionTitle) => {
    setSearchQuery(suggestionTitle);
    setIsDropdownOpen(false);
    navigate(`/search?query=${encodeURIComponent(suggestionTitle.trim())}&category=${selectedCategory}`);
  };

  return (
    <div id="MainHeader" className="bg-white py-3 px-4 border-b">
      <div className="flex flex-col md:flex-row items-center w-full mx-auto max-w-[100%] gap-5">
        <div className="flex items-center justify-between w-full md:w-auto">
          <a href="/" className="flex-shrink-0">
            <img width="120" src="/images/logo.svg" alt="Logo" />
          </a>
        </div>

        <div className="relative w-full flex-grow" ref={searchContainerRef}>
          <form onSubmit={handleSubmit} className="w-full flex items-center">
            <div className="flex-grow flex items-center border-2 border-gray-700 rounded-full h-12 bg-white focus-within:border-blue-500">
              <div className="pl-5 pr-3"><Search size={20} className="text-gray-500" /></div>

              <input
                className="w-full h-full text-base focus:outline-none bg-transparent"
                placeholder="Search for anything"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                autoComplete="off"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="pr-4">
                  <X size={20} className="text-gray-500" />
                </button>
              )}

              <div className="border-l-2 border-gray-300 h-full items-center hidden sm:flex">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-full text-sm bg-transparent pl-4 pr-8 focus:outline-none cursor-pointer text-gray-700 appearance-none"
                >
                  <option value="0">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-gray-700 -ml-6 pointer-events-none mr-3" />
              </div>
            </div>

            <button type="submit" className="bg-[#3665f3] text-white h-12 ml-2 rounded-full flex items-center justify-center px-12 font-semibold">
              Search
            </button>
          </form>

          {/* === GIAO DIỆN DROPDOWN GỢI Ý MỚI === */}
          {isDropdownOpen && searchQuery.length > 0 && (
            <div className="absolute top-full mt-1 w-[calc(100%-8rem)] bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden">
              <ul>
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map(product => (
                    <li key={product._id}>
                      <button
                        onClick={() => handleSuggestionClick(product.title)}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                      >
                        <Search size={18} className="text-gray-400" />
                        <span>{product.title}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No suggestions found.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainHeader;