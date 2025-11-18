import { FaPlus } from "react-icons/fa";
import { BsFillBagCheckFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between bg-white px-4 py-4 shadow">
      {/* Left side - Mobile menu button */}
      <div className="flex items-center">
        <button
          className="md:hidden text-gray-600 focus:outline-none cursor-pointer"
          onClick={onMenuClick}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Right side - Buttons */}
      <div className="flex gap-3">
        {/* Add Food Item */}
        <div>
          <button
            onClick={() => navigate("/add-food-item")}
            className="hidden md:flex items-center text-blue-500 bg-blue-100 gap-2 p-2 font-bold cursor-pointer rounded-full"
          >
            <FaPlus size={18} />
            <span>Add food item</span>
          </button>

          {/* Mobile Add Button */}
          <button
            onClick={() => navigate("/add-food-item")}
            className="md:hidden flex items-center text-blue-500 bg-blue-100 p-2 font-bold cursor-pointer rounded-full"
          >
            <FaPlus size={18} />
          </button>
        </div>

        {/* My Orders */}
        <button
          onClick={() => navigate("/orders")}
          className="hidden md:flex items-center gap-2 cursor-pointer relative rounded-full text-blue-500 bg-blue-100 px-3 py-1 font-bold">
          <BsFillBagCheckFill size={20} />
          <span>My Orders</span>
          <span className="absolute -right-2 -top-2 text-xs text-blue-100 bg-blue-500 font-bold rounded-full px-[6px] py-[1px]">
            0
          </span>
        </button>

        {/* Mobile My Orders */}
        <button
          onClick={() => navigate("/orders")}
          className="md:hidden flex items-center gap-2 cursor-pointer relative rounded-full text-blue-500 bg-blue-100 px-3 py-1 font-bold">
          <BsFillBagCheckFill size={20} />
          <span className="absolute -right-2 -top-2 text-xs text-blue-100 bg-blue-500 font-bold rounded-full px-[6px] py-[1px]">
            0
          </span>
        </button>
      </div>
    </header>
  );
}
