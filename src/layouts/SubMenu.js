import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SubMenu() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
  { name: "eBay Live", path: "/live" },
  { name: "Saved", path: "/saved" },
  { name: "Motors", path: "/motors" },
  { name: "Electronics", path: "/electronics" },
  { name: "Collectibles", path: "/collectibles" },
  { name: "Home & Garden", path: "/home-garden" },
  { name: "Clothing, Shoes & Accessories", path: "/fashion" },
  { name: "Toys", path: "/toys" },
  { name: "Sporting Goods", path: "/sporting-goods" },
  { name: "Business & Industrial", path: "/business-industrial" },
  { name: "Jewelry & Watches", path: "/jewelry-watches" },
  { name: "Refurbished", path: "/refurbished" },
];
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Danh sách các mục menu tĩnh
        const staticMenuItems = [
          { name: "eBay Live", path: "/live", isStatic: true },
          { name: "Saved", path: "/saved", isStatic: true },
        ];
        
        // Gọi API để lấy danh sách danh mục
        const response = await fetch("http://localhost:3000/categories");
        const data = await response.json();

        // Định dạng lại dữ liệu từ API để thêm 'path' cho Link component
        const formattedData = data.map((category) => ({
          ...category,
          id: category._id || category.id, // Đảm bảo có id
          name: category.name,
          path: `/list-category/${category._id || category.id}`, // Tạo path động
        }));

        // Kết hợp menu tĩnh và menu từ API
        const allItems = [
          ...staticMenuItems,
          ...formattedData,
        ];

        setCategories(allItems);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to a default list in case of error
        setCategories([
          { name: "eBay Live", path: "/live" },
          { name: "Saved", path: "/saved" },
          { name: "Electronics", path: "/electronics" },
          { name: "Home & Garden", path: "/home-garden" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle menu item click
  const handleMenuClick = (item) => {
    if (item.isStatic) {
      // Handle static menu items (Home, Saved, Sell)
      if (item.id === "home") {
        navigate("/");
      } else {
        // You can add more navigation logic for other static items
        console.log(`Clicked on ${item.name}`);
      }
    } else {
      // Navigate to list category page for category items
      // Use the string ID directly without parsing to number
      navigate(`/list-category/${item.id}`);
    }
  };

  return (
    <div id="SubMenu" className="bg-white">
      <div className="flex items-center justify-center w-full mx-auto max-w-[100%] h-10 px-4">
        <nav>
          <ul className="flex items-center space-x-6">
            {loading ? (
              // Hiển thị trạng thái loading
              <li className="text-sm font-semibold text-gray-500">Loading Categories...</li>
            ) : (
              // Render các mục menu sau khi tải xong
              categories.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path} // Sử dụng path đã được định nghĩa
                    className="text-sm font-semibold text-gray-700 hover:text-blue-600 pb-2 whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}