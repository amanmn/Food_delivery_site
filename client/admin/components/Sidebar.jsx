import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaCog,
  FaTimes,
} from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ closeSidebar }) {
  const navigate = useNavigate();

  return (
    <aside className="h-full w-64 px-3 bg-gray-900 text-white relative">
      {/* Close button for mobile */}
      <button
        className="absolute top-4 right-4 md:hidden bg-blue-500 cursor-pointer text-white text-2xl p-1 rounded focus:outline-none"
        onClick={closeSidebar}
      >
        <FaTimes />
      </button>

      <h2 className="text-2xl font-bold p-4 border-b border-gray-700 text-blue-500">
        Owner Dashboard
      </h2>

      <nav className="flex flex-col p-4 space-y-2">
        <button
          onClick={() => {
            navigate("/dash");
            closeSidebar();
          }}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          <FaHome /> Home
        </button>

        <button
          onClick={() => {
            navigate("/my-shop");
            closeSidebar();
          }}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          <FaShop /> MyShop
        </button>

        <button
          onClick={() => {
            navigate("/orders");
            closeSidebar();
          }}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          <FaShoppingCart /> Orders
        </button>

        <button
          onClick={() => {
            navigate("/item-product");
            closeSidebar();
          }}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          <FaBoxOpen /> Products
        </button>

        <button
          onClick={() => {
            navigate("/customers");
            closeSidebar();
          }}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          <FaUsers /> Customers
        </button>

        <button
          onClick={() => {
            navigate("/settings");
            closeSidebar();
          }}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded w-full text-left"
        >
          <FaCog /> Settings
        </button>
      </nav>
    </aside>
  );
}
