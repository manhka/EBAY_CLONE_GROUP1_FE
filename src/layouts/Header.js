import { useState, useEffect } from "react";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiInterceptor from "../services/apiInterceptor";

export default function MainHeader() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("0"); // Chỉ cần 1 state cho category
  const [categories, setCategories] = useState([]); // 2. State để lưu danh sách category

  // 3. Fetch dữ liệu category từ API khi component được tải
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiInterceptor.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // 4. Sửa lại hàm handleSubmit để dùng đúng state
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}&category=${selectedCategory}`);
    }
  };

  return (
    <div id="MainHeader" className="bg-white py-3 px-4 border-b">
      <div className="flex flex-col md:flex-row items-center w-full mx-auto max-w-[1300px] gap-5">
        {/* Logo và Nút Category */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <a href="/" className="flex-shrink-0">
            <img width="120" src="/images/logo.svg" alt="Logo" />
          </a>
        </div>

        {/* Search Form */}
        <div className="w-full flex-grow flex items-center">
          <form onSubmit={handleSubmit} className="w-full flex items-center">
            <div className="flex-grow flex items-center border-2 border-gray-400 focus-within:border-black rounded-full h-11 md:h-12">
              <div className="pl-4 pr-2 hidden md:block">
                <Search size={20} className="text-gray-500" />
              </div>

              <input
                className="w-full h-full placeholder-gray-500 text-sm md:text-base focus:outline-none bg-transparent px-4 md:px-0"
                placeholder="Search for anything"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* 2. Ẩn dropdown category trên màn hình nhỏ để tiết kiệm không gian */}
              <div className="border-l-2 border-gray-300 h-full items-center hidden sm:flex">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-full text-sm bg-transparent pl-4 pr-8 focus:outline-none cursor-pointer text-gray-700 appearance-none"
                  aria-label="Select a category for search"
                >
                  <option value="0">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-gray-700 -ml-6 pointer-events-none mr-3" />
              </div>
            </div>

            {/* 3. Thay đổi nút Search: chỉ icon trên mobile, có chữ trên desktop */}
            <button
              type="submit"
              className="bg-[#3665f3] text-white h-11 md:h-12 ml-2 rounded-full flex items-center justify-center px-4 md:px-12 font-semibold w-32 md:w-48"
            >
              <Search size={20} className="md:hidden" />
              <span className="hidden md:block">Search</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}