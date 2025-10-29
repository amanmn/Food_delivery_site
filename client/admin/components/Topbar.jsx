import { FaPlus } from "react-icons/fa";
import { BsFillBagCheckFill } from "react-icons/bs";
import { useSelector } from "react-redux";

export default function Topbar({ onMenuClick }) {
  const { myShopData } = useSelector(state => state.owner);

  return (
    <header className="flex items-center justify-between bg-white px-4 py-4 shadow">
      {/* Left side - Mobile menu button */}
      <div className="flex items-center">
        <button
          className="md:hidden text-gray-600 focus:outline-none cursor-pointer" // Hide button from tablet & up
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

      {/* Right side - User info */}
      {myShopData &&
        (
          <div className="flex gap-2">
            <div>
              <button className="hidden md:flex items-center text-blue-500 bg-blue-100 gap-1 p-2 font-bold cursor-pointer rounded-3xl">
                <FaPlus size={20} />
                <span >Add food item</span>
              </button>
              <button className="md:hidden flex items-center text-blue-500 bg-blue-100 p-2 font-bold cursor-pointer rounded-full">
                <FaPlus size={20} />
              </button>
            </div>
            <div className="hidden md:flex items-center gap-2 cursor-pointer relative rounded-3xl text-blue-500 bg-blue-100 px-3 py-1 font-bold">
              <BsFillBagCheckFill size={20} />
              <span>My Orders</span>
              <span className="absolute -right-2 -top-2 text-md text-blue-200 bg-blue-500 font-bold rounded-full px-[6px] py-[1px]">0</span>
            </div>
            <div className="md:hidden flex items-center gap-2 cursor-pointer rounded-3xl text-blue-500 bg-blue-100 px-3 py-1 font-bold">
              <BsFillBagCheckFill size={20} />
              <span className="absolute right-2 top-2 text-md text-blue-200 bg-blue-500 font-bold rounded-full px-[6px] py-[1px]">0</span>
            </div>
          </div>
        )
      }
    </header>
  );
}
