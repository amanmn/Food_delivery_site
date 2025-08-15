import { FaUserCircle } from "react-icons/fa";

export default function Topbar({ onMenuClick }) {
  return (
    <header className="flex items-center justify-between bg-white px-4 py-4 shadow">
      {/* Left side - Mobile menu button */}
      <div className="flex items-center">
        <button
          className="md:hidden text-gray-600 focus:outline-none" // Hide button from tablet & up
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
      <div className="flex items-center space-x-2">
        <span className="hidden sm:block text-md font-medium">Super Admin</span>
        <FaUserCircle size={36} className="text-gray-600" />
      </div>
    </header>
  );
}
