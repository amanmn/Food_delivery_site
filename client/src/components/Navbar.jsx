import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { useSelector, useDispatch } from "react-redux";
import Logo from "../utils/logo.png";
import defaultAvatar from "../utils/user.jpg";
import Button from "./Button";
import { userLoggedOut } from "../redux/features/auth/authSlice";
import LocationModal from "../components/LocationModal";
import { MdLocationPin } from "react-icons/md";
import { setLocation } from "../redux/features/location/locationSlice"; // ✅ ADD THIS

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useSelector((state) => state.location.location);

  const { user } = useSelector((state) => state.auth);
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

  const truncateLocation = (text) => {
    const city = text.split(",")[0]?.trim() || text;
    return city.length > 6 ? city.slice(0, 6) + "..." : city;
  };

  return (
    <nav className={`w-full top-0 left-0 z-50 py-5 transition-all duration-300 ${isMobile ? "bg-red-500" : "bg-pink-50"}`}>
      <div className="max-w-screen-xl mx-auto px-5 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src={Logo} alt="Fudo Logo" className="w-12 h-12 object-contain" />
          {!isMobile && <span className="text-gray-700 text-2xl font-bold tracking-wide">Fudo</span>}
        </Link>

        {!isMobile && (
          <div className="flex space-x-14 text-lg text-gray-700 font-semibold tracking-wide">
            <ScrollLink to="home" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Home</ScrollLink>
            <ScrollLink to="services" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Services</ScrollLink>
            <ScrollLink to="menu" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Menu</ScrollLink>
            <ScrollLink to="contact" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Contact</ScrollLink>
          </div>
        )}

        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-700 pr-2 py-1 rounded-md sm:hover:text-red-500 transition text-sm hover:text-black sm:text-base md:text-lg flex items-center"
              aria-label="Location"
            >
              <span className="inline-block cursor-pointer">
                {location ? ` ${truncateLocation(location)}` : "Location"}
              </span>
              <MdLocationPin className="text-xl sm:text-red-500" />
            </button>
          )}

          {!isMobile && user ? (
            <div className="relative">
              <img
                loading="lazy"
                src={user.profilePicture || defaultAvatar}
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
          ) : !isMobile && (
            <Link to="/login">
              <Button
                text="Login"
                className="text-lg px-6 py-3 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition"
              />
            </Link>
          )}

          {isMobile && (
            <button className="text-white text-2xl pr-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
              {isOpen ? "✖" : "☰"}
            </button>
          )}
        </div>
      </div>

      {/* ✅ Pass dispatch logic as prop */}
      <LocationModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSetLocation={(location) => dispatch(setLocation(location))}
      />

      {isMobile && isOpen && (
        <div className="bg-red-500 text-white py-4 flex flex-col items-center w-full fixed top-20 left-0 z-40">
          <ScrollLink to="home" smooth duration={500} onClick={() => setIsOpen(false)} className="block px-8 py-3 text-lg font-medium tracking-wide hover:bg-red-600 w-full text-center">Home</ScrollLink>
          <ScrollLink to="services" smooth duration={500} onClick={() => setIsOpen(false)} className="block px-8 py-3 text-lg font-medium tracking-wide hover:bg-red-600 w-full text-center">Services</ScrollLink>
          <ScrollLink to="menu" smooth duration={500} onClick={() => setIsOpen(false)} className="block px-8 py-3 text-lg font-medium tracking-wide hover:bg-red-600 w-full text-center">Menu</ScrollLink>
          <ScrollLink to="contact" smooth duration={500} onClick={() => setIsOpen(false)} className="block px-8 py-3 text-lg font-medium tracking-wide hover:bg-red-600 w-full text-center">Contact</ScrollLink>

          {user ? (
            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="mt-3 px-8 py-3 text-lg font-medium tracking-wide bg-white text-red-500 rounded-lg w-full text-center hover:bg-gray-200">
              Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="mt-3 px-8 py-3 text-lg font-medium tracking-wide bg-white text-red-500 rounded-lg w-full text-center hover:bg-gray-200">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
