import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { useSelector, useDispatch } from "react-redux";
import Logo from "../utils/logo.png";
import defaultAvatar from "../utils/user.jpg";
import Button from "./Button";
import { FaShoppingCart } from "react-icons/fa";
import { userLoggedOut } from "../redux/features/auth/authSlice";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useSelector((state) => state.auth); // ✅ Fixed

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(userLoggedOut());
    setShowDropdown(false);
    navigate("/");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className={`${isMobile ? "bg-red-500 px-0" : "bg-pink-50"} w-full top-0 left-0 z-50 py-5 transition-all duration-300`}>
      <div className="max-w-screen-xl mx-auto px-5 flex justify-between items-center flex-nowrap">

        {/* Logo */}
        <Link to="/" className="text-2xl flex items-center space-x-3">
          <img src={Logo} alt="Fudo Logo" className="w-12 h-12 object-contain" />
          {!isMobile && <span className="text-gray-700 text-2xl font-bold tracking-wide">Fudo</span>}
        </Link>

        {/* Desktop Menu */}
        {!isMobile && (
          <div className="flex space-x-14 text-lg text-gray-700 font-semibold tracking-wide">
            <ScrollLink to="home" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Home</ScrollLink>
            <ScrollLink to="services" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Services</ScrollLink>
            <ScrollLink to="menu" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Menu</ScrollLink>
            <ScrollLink to="contact" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Contact</ScrollLink>
          </div>
        )}

        {/* Desktop Icons */}
        {!isMobile && user && (
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={user.profilepicture||defaultAvatar}
                alt="User"
                onClick={toggleDropdown}
                className="w-12 h-12 rounded-full cursor-pointer border border-gray-400"
              />
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
                  <button onClick={() => { navigate("/profile"); setShowDropdown(false); }} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">My Profile</button>
                  <button onClick={() => { navigate("/cart"); setShowDropdown(false); }} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">Cart</button>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop Login Button if Not Logged In */}
        {!isMobile && !user && (
          <Link to="/login">
            <Button
              text="Login"
              className="text-lg px-6 py-3 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition"
            />
          </Link>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button className="text-white text-2xl pr-5" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "✖" : "☰"}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isOpen && (
        <div className="bg-red-500 text-white py-3 flex flex-col items-center w-full fixed top-16 left-0">
          <ScrollLink to="home" smooth duration={500} onClick={() => setIsOpen(false)} className="block px-8 py-3 text-lg font-medium tracking-wide hover:bg-red-600 w-full text-center">Home</ScrollLink>
          <ScrollLink to="services" smooth duration={500} onClick={() => setIsOpen(false)} className="block px-8 py-3 text-lg font-medium tracking-wide hover:bg-red-600 w-full text-center">Services</ScrollLink>
          <ScrollLink to="menu" smooth duration={500} onClick={() => setIsOpen(false)} className="block px-8 py-3 text-lg font-medium tracking-wide hover:bg-red-600 w-full text-center">Menu</ScrollLink>
          <ScrollLink to="contact" smooth duration={500} onClick={() => setIsOpen(false)} className="block px-8 py-3 text-lg font-medium tracking-wide hover:bg-red-600 w-full text-center">Contact</ScrollLink>

          {/* Mobile Login/Logout */}
          {user ? (
            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="mt-3 px-8 py-3 text-lg font-medium tracking-wide bg-red text-white rounded-lg w-full text-center hover:bg-red-600">
              Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="mt-3 px-8 py-3 text-lg font-medium tracking-wide bg-red-500 text-white rounded-lg w-full text-center hover:bg-red-600">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
