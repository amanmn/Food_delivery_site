import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";

export default function Sidebar({ closeSidebar }) {
  return (
    <aside className="h-full w-80 px-3 bg-gray-900 text-white relative">
      {/* Close button for mobile */}
      <button
        className="absolute top-4.5 bg-blue-500 cursor-pointer right-4 md:hidden text-white text-3xl focus:outline-none"
        onClick={closeSidebar}
      >
        <FaTimes />
      </button>

      <h2 className="text-2xl font-bold p-4 border-b border-gray-700 text-blue-500">
        Owner Dashboard
      </h2>

      <nav className="flex flex-col p-4 space-y-2 gap-2">
        <a
          href="/dash"
          onClick={closeSidebar}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
        >
          <FaHome /> Home
        </a>
        <a
          href="/my-shop"
          onClick={closeSidebar}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
        >
          <FaShop /> MyShop
        </a>
        <a
          href="#"
          onClick={closeSidebar}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
        >
          <FaShoppingCart /> Orders
        </a>
        <a
          href="#"
          onClick={closeSidebar}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
        >
          <FaBoxOpen /> Products
        </a>
        <a
          href="#"
          onClick={closeSidebar}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
        >
          <FaUsers /> Customers
        </a>
        <a
          href="/settings"
          // onClick={closeSidebar}
          className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded"
        >
          <FaCog /> Settings
        </a>
      </nav>
    </aside>
  );
}
