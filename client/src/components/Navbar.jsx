import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { useSelector, useDispatch } from "react-redux";
import Logo from "../utils/logo.png";
import defaultAvatar from "../utils/user.jpg";
import Button from "./Button";
import { useLogoutUserMutation } from "../redux/features/auth/authApi";
import { userLoggedOut } from "../redux/features/auth/authSlice";
import LocationModal from "../components/LocationModal";
import { FaLocationDot } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { RiMenuLine } from "react-icons/ri";
import { setCity } from "../redux/features/user/userSlice";
import { toast } from "react-toastify";
import { persistor } from "../redux/store";
import { useGetCartItemsQuery } from "../redux/features/cart/cartApi";
import { useSearchItemsQuery } from "../redux/features/product/itemApi";
import { setSearchQuery } from "../redux/features/user/userSlice";
import SearchItems from "./SearchedItems";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInputBox, setShowInputBox] = useState(false);

  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");

  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const city = useSelector((state) => state.user?.city) || "Add";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(text.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    if (showInputBox) {
      inputRef.current?.focus();
    }

  }, [showInputBox]);

  //search items query
  const { data: items = [], isLoading, isFetching } =
    useSearchItemsQuery(
      { query: debounced, city },
      {
        skip: !debounced || debounced.length < 2 || !city,
      }
    );

  // cart items query
  const { data: cartData } = useGetCartItemsQuery(undefined, {
    skip: !user,
  });

  const cartItems = cartData?.items || [];
  const totalQuantity = new Set(
    cartItems.map((item) => item.product?._id || item.product)
  ).size;

  // logout mutation
  const [logoutUser] = useLogoutUserMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(userLoggedOut());
      await persistor.purge();
      toast.warning("Logout successful");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // search box close
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowInputBox(false); // ✅ close search

      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setShowDropdown(false); // close dropdown
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const resize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <nav className={`w-full top-0 left-0 z-50 py-4 transition-all duration-300 ${isMobile ? "bg-red-500" : "bg-pink-50"}`}>
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-32 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img src={Logo} alt="Fudo Logo" className="w-12 h-12 object-contain" />
          {!isMobile && (
            <span className="text-gray-700 text-2xl font-bold tracking-wide">
              Fudo
            </span>
          )}
        </Link>

        {/* Desktop Links */}
        {!isMobile && (
          <div className="flex space-x-12 text-lg text-gray-700 font-semibold">
            <ScrollLink to="home" smooth duration={500} className="cursor-pointer hover:text-red-500">Home</ScrollLink>
            <ScrollLink to="category" smooth duration={500} className="cursor-pointer hover:text-red-500">Category</ScrollLink>
            <ScrollLink to="menu" smooth duration={500} className="cursor-pointer hover:text-red-500">Menu</ScrollLink>
            <ScrollLink to="services" smooth duration={500} className="cursor-pointer hover:text-red-500">Services</ScrollLink>
            <ScrollLink to="contact" smooth duration={500} className="cursor-pointer hover:text-red-500">Contact</ScrollLink>
          </div>
        )}

        {/* Search Box */}
        {showInputBox && (
          <div
            ref={searchRef}
            className="fixed top-[80px] mx-auto left-[20%] w-[60%] bg-white rounded-lg shadow-xl px-6 py-4 z-50">
            <div className="flex items-center gap-3">
              <FaLocationDot
                size={24}
                className="text-red-500 cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              />

              <IoIosSearch size={30} className='text-[#ff4d2d]' />

              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  dispatch(setSearchQuery(e.target.value))
                }}
                placeholder="search delicious food..."
                className="w-full text-lg outline-none text-gray-700"
              />

              <RxCross2
                size={24}
                className="cursor-pointer"
                onClick={() => {
                  setShowInputBox(false);
                  setText("");
                  setDebounced("");
                }}
              />
            </div>

            {(isLoading || isFetching) && (
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            )}

            <SearchItems onClick={() => setShowInputBox(false)} />

            {debounced && !isLoading && items.length === 0 && (
              <p className="text-sm text-gray-500 mt-3">No items found 😕</p>
            )}
          </div>
        )}

        {/* Right Icons */}
        <div className="flex items-center space-x-5">
          {!(showInputBox && isOpen) && (!showInputBox && !isOpen ? (
            <IoIosSearch
              size={30}
              className="lg:text-[#ff4d2d] md:text-red-500 text-white cursor-pointer"
              onClick={() => setShowInputBox(true)}
            />) : !isOpen ? (
              <RxCross2
                size={25}
                className="lg:text-[#ff4d2d] text-gray-800 cursor-pointer"
                onClick={() =>
                  setShowInputBox(false)
                }
              />) : null
          )}
          {user && (
            <button
              type="button"
              onClick={() => {
                navigate("/cart");
                setShowDropdown(false);
              }}
              className="block text-left px-5 sm:text-gray-800 cursor-pointer"
            >
              <div className="relative cursor-pointer font-xl lg:text-red-500 md:text-red-500 text-gray-800">
                <FiShoppingCart size={25} /> {
                  totalQuantity > 0 ? (
                    <span className="absolute right-[-9px] top-[-12px] font-semibold">
                      {totalQuantity}
                    </span>
                  ) : (
                    <span className="absolute right-[-9px] top-[-12px] font-semibold">
                      {totalQuantity}
                    </span>
                  )}
              </div>
            </button>
          )} {user ? (
            <div ref={dropdownRef} className="relative">
              <img
                loading="lazy"
                src={user.profilePicture || defaultAvatar}
                alt="User"
                onClick={toggleDropdown}
                className="w-12 h-12 rounded-full cursor-pointer border border-gray-400"
              />
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 cursor-pointer font-semibold tracking-wide hover:bg-gray-100">
                    My Profile
                  </button>
                  <button onClick={() => {
                    navigate("/order");
                    setShowDropdown(false);
                  }}
                    className="block w-full text-left px-4 py-2 text-gray-700 cursor-pointer font-semibold tracking-wide hover:bg-gray-100">
                    Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100 font-semibold tracking-wide"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : !isMobile && (
            <Link
              to="/login">
              <Button text="Login" className="text-lg px-6 py-3 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition" />
            </Link>
          )}
          {isMobile && !user && (
            <button className="text-white text-2xl pr-2"
              onClick={() => { setIsOpen(!isOpen); }}
              aria-label="Toggle Menu"
            >
              {isOpen ? <RxCross2 size={35} /> : <RiMenuLine />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}

      {
        isMobile && isOpen && (
          <div className="bg-red-500 text-white py-4 flex flex-col items-center w-full left-0 z-40">
            {["home", "menu", "category", "services", "contact"].map((item) => (
              <ScrollLink
                key={item}
                to={item}
                smooth
                duration={500}
                onClick={() => setIsOpen(false)}
                className="block px-8 py-3 text-lg text-center rounded-lg w-full hover:bg-red-600"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </ScrollLink>
            ))}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="mt-3 px-8 py-3 text-lg font-medium tracking-wide bg-white text-red-500 rounded-lg w-full text-center hover:bg-gray-200"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() =>
                  setIsOpen(false)
                }
                className="py-3 font-medium tracking-wide bg-red-50 text-red-500 rounded-lg w-full text-center hover:bg-red-600 hover:text-gray-200"
              > Login
              </Link>
            )}
          </div>
        )
      }

      <LocationModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSetLocation={(location) => dispatch(setCity(location))}
      />
    </nav >
  );
};

export default Navbar;
