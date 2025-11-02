import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { GoLocation } from "react-icons/go";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setCity, setState } from "../redux/features/user/userSlice";
import useDetectLocation from "../hooks/useDetectLocation";

const LocationModal = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const BASE_URL = import.meta.env.VITE_BASEURL;
  const { user } = useSelector((state) => state.user);

  const [manualLocation, setManualLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const detectLocation = useDetectLocation();

  const handleDetect = async () => {
    await detectLocation();
    setIsOpen(false);
  };

  // Handle selecting a suggestion
  const handleSuggestionClick = (place) => {
    const selected = place.display_name;
    dispatch(setCity(selected));
    setManualLocation("");
    setSuggestions([]);
    setIsOpen(false);
    toast.success("Location selected");
  };

  // Handle outside click
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (manualLocation.trim() === "") {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/map/search?q=${manualLocation.trim()}`);
        const data = await res.json();
        console.log(data);
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
        toast.error("Failed to fetch suggestions");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);

  }, [manualLocation]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains("bg-black/70")) {
        setIsOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [setIsOpen]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-black/70 flex p-4 items-start justify-center pt-24 overflow-y-auto">
      <div className="bg-white w-11/12 sm:max-w-md rounded-xl shadow-xl p-6 relative">
        {/* Close Icon */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
          aria-label="Close"
        >
          <IoMdClose />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Location</h2>

        {/* Input */}
        <input
          type="text"
          aria-label="Search location"
          autoFocus
          disabled={loading}
          value={manualLocation || ""}
          onChange={(e) => setManualLocation(e.target.value)}
          placeholder="Search or type your city"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {/* Manual city confirm button */}
        {manualLocation && suggestions.length === 0 && (
          <button
            onClick={() => {
              dispatch(setCity(manualLocation.trim()));
              setManualLocation("");
              setIsOpen(false);
              toast.success("City saved manually");
            }}
            className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Use “{manualLocation}”
          </button>
        )}

        {/* Loader */}
        {loading && <p className="text-sm text-gray-500 mt-2">Loading...</p>}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <ul className="border border-gray-200 rounded-md mt-2 max-h-48 overflow-y-auto bg-white shadow-md">
            {suggestions.map((place, index) => (
              <li
                key={place.place_id || index}
                onClick={() => handleSuggestionClick(place)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
              >
                {place.display_name?.split(",").slice(0, 2).join(", ")}
                <span className="text-xs text-gray-400 ml-1">
                  {place.address?.state ? `(${place.address.state})` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!loading && manualLocation && suggestions.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">No results found</p>
        )}

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="w-full border-t border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <div className="w-full border-t border-gray-300" />
        </div>

        {/* Current Location */}
        <div className="flex items-start justify-between bg-gray-50 border rounded-lg px-4 py-3">
          <div className="flex gap-3 items-start">
            <GoLocation className="text-red-500 text-xl mt-1" />
            <div>
              <p className="text-red-500 font-semibold">Current Location</p>
              <p className="text-gray-600 text-sm">Use your device's location</p>
            </div>
          </div>
          <button
            onClick={handleDetect}
            className="border border-red-500 text-red-500 font-semibold px-3 py-1 text-sm rounded-lg hover:bg-red-500 hover:text-white transition"
            disabled={loading}
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
