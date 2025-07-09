import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiInterceptor from "../services/apiInterceptor";

export default function SubMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const staticMenuItems = [
    { _id: "home", name: "Home", path: "/" },
    { _id: "saved", name: "Saved", path: "/saved" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const { data: apiCategories } = await apiInterceptor.get('/categories');
        const formattedCategories = apiCategories.map((category) => ({
          ...category,
          path: `/categories/${category._id}`, // Tạo path động
        }));

        setMenuItems([...staticMenuItems, ...formattedCategories]);

      } catch (error) {
        console.error("Error fetching categories:", error);
        setMenuItems(staticMenuItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);


  return (
    <div id="SubMenu" className="bg-white border-b">
      <div className="flex items-center justify-center w-full mx-auto max-w-[95%] h-10 px-4">
        <nav>
          <ul className="flex items-center space-x-6">
            {isLoading ? (
              <li className="text-sm font-semibold text-gray-500">Loading Categories...</li>
            ) : (
              menuItems.map((item) => (
                <li key={item._id}>
                  <Link
                    to={item.path}
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
