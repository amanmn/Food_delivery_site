import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { useSelector, useDispatch } from "react-redux";
import Logo from "../utils/logo.png";
import defaultAvatar from "../utils/user.jpg";
import Button from "./Button";
import { useLogoutUserMutation } from "../redux/features/auth/authApi";
import { userLoggedOut } from "../redux/features/auth/authSlice";
import LocationModal from "../components/LocationModal";
import { FaCross, FaLocationDot } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { RiMenuLine } from "react-icons/ri";
import { setCity } from "../redux/features/user/userSlice"; // ✅ ADD THIS
import { toast } from "react-toastify";
import { persistor } from "../redux/store";
import { useGetCartItemsQuery } from "../redux/features/cart/cartApi";


const Navbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInputBox, setshowInputBox] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutUser] = useLogoutUserMutation();

  const { user } = useSelector((state) => state.auth);
  const { city } = useSelector((state) => state.user) || "Add";
  // const { cartItems } = useSelector((state) => state.cart);

  const { data: cartData } = useGetCartItemsQuery(undefined, {
    skip: !user, // only fetch if logged in
  });

  const cartItems = cartData?.items || 0;
  const totalQuantity = Array.isArray(cartItems)
    ? new Set(cartItems.map((item) => item.product?._id || item.product)).size
    : 0;

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();  // ✅ CALLS BACKEND
      dispatch(userLoggedOut());  // ✅ RESET LOCAL STATE
      await persistor.purge(); // ✅ clears persisted data
      toast.warning("Logout successful");
    } catch (err) {
      console.error("Logout failed:", err);
    }
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

  // const truncateLocation = (text) => {
  //   const city = text.split(",")[0]?.trim() || text;
  //   return city.length > 6 ? city.slice(0, 6) + "..." : city;
  // };

  return (
    <nav className={`w-full top-0 left-0 z-50 py-4 transition-all duration-300 ${isMobile ? "bg-red-500" : "bg-pink-50"}`}>
      <div className="max-w-screen-xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src={Logo} alt="Fudo Logo" className="w-12 h-12 object-contain" />
          {!isMobile && <span className="text-gray-700 text-2xl font-bold tracking-wide">Fudo</span>}
        </Link>

        {showInputBox &&
          <div className='w-[80%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] px-6 left-[10%]'>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="lg:text-red-500 md:text-red-500 pr-2 rounded-md flex text-gray-800 lg:hover:text-red-600 transition text-lg items-center"
              aria-label="Location"
            >
              {city &&
                <span className="w-[75%] truncate m-1 ">
                  {city}
                </span>
              }
              <FaLocationDot size={25} className="cursor-pointer lg:text-red-500 md:text-red-500 text-gray-800" />
            </button>
            <div className='w-[80%] flex items-center gap-[10px]'>
              <IoIosSearch size={30} className='text-[#ff4d2d]' />
              <input
                type="text"
                placeholder='search delicious food...'
                className='px-[10px] text-gray-700 text-lg outline-0 w-full' />
            </div>
          </div>
        }

        {!isMobile && (
          <div className="flex space-x-12 text-lg text-gray-700 font-semibold tracking-wide">
            <ScrollLink to="home" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Home</ScrollLink>
            <ScrollLink to="services" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Services</ScrollLink>
            <ScrollLink to="menu" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Menu</ScrollLink>
            <ScrollLink to="contact" smooth duration={500} className="cursor-pointer hover:text-red-500 transition">Contact</ScrollLink>
          </div>
        )}

        <div className="flex items-center space-x-5">

          {!(showInputBox && isOpen) && (
            !showInputBox && !isOpen ? (
              <IoIosSearch
                size={30}
                className="lg:text-[#ff4d2d] md:text-red-500 text-white cursor-pointer"
                onClick={() => setshowInputBox(true)}
              />
            ) : !isOpen ? (
              <RxCross2
                size={25}
                className="lg:text-[#ff4d2d] text-gray-800 cursor-pointer"
                onClick={() => setshowInputBox(false)}
              />
            ) : null
          )}


          {user && (
            <button
              type="button"
              onClick={() => { navigate("/cart"); setShowDropdown(false); }}
              className="block text-left px-5 sm:text-gray-800 cursor-pointer"
            >
              <div className="relative cursor-pointer font-xl lg:text-red-500 md:text-red-500 text-gray-800">
                <FiShoppingCart size={25} />
                {totalQuantity > 0 ? (
                  <span className="absolute right-[-9px] top-[-12px] font-semibold">
                    {totalQuantity}
                  </span>
                )
                  :
                  (<span className="absolute right-[-9px] top-[-12px] font-semibold">
                    {totalQuantity}
                  </span>)
                }
              </div>
            </button>
          )}

          {user ? (
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
                  <button onClick={() => { navigate("/profile"); setShowDropdown(false); }} className="block w-full text-left px-4 py-2 text-gray-700 cursor-pointer font-semibold tracking-wide hover:bg-gray-100">My Profile</button>
                  <button onClick={() => { navigate("/order"); setShowDropdown(false); }} className="block w-full text-left px-4 py-2 text-gray-700 cursor-pointer font-semibold tracking-wide hover:bg-gray-100">Orders</button>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100 font-semibold tracking-wide">Logout</button>
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

          {isMobile && !user && (
            <button
              className="text-white text-2xl pr-2"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              aria-label="Toggle Menu">
              {isOpen ? <RxCross2 size={35} /> : <RiMenuLine />}
            </button>
          )}
        </div>
      </div>

      {/* ✅ Pass dispatch logic as prop */}
      <LocationModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSetLocation={(location) => dispatch(setCity(location))}
      />

      {
        isMobile && isOpen && (
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
        )
      }
    </nav >
  );
};

export default Navbar;
