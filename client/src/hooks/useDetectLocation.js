import { useDispatch, useSelector } from "react-redux";
import { setCity, setState, updateSelectedAddress } from "../redux/features/user/userSlice";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { setAddress, setLocation } from "../redux/features/location/locationSlice";

const useDetectLocation = () => {
  const dispatch = useDispatch();
  const { city } = useSelector((state) => state.user);
  const APIKEY = import.meta.env.VITE_GEOAPIKEY;

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(setLocation({ lat: latitude, lon: longitude }))
        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${APIKEY}`
          );
          const data = await res.json();
          console.log("address", data.results[0]?.city);

          const city = data.results[0]?.city || "Unknown";
          const state = data.results[0]?.state || "Unknown";
          const address = data.results[0]?.address_line2 || data.results[0]?.formatted
          toast.success(`Location detected ${city}`);
          dispatch(setCity(city));
          dispatch(setState(state));
          dispatch(updateSelectedAddress(address))
          dispatch(setAddress(data?.results[0].address_line2))
        } catch (error) {
          console.error("Location fetch failed:", error);
          toast.error("Failed to detect location");
        }
      },
      (error) => {
        console.error("Permission denied or error:", error);
        toast.error("Location access denied");
      }
    );
  };

  useEffect(() => {
    if (!city) {
      detectLocation()
    }
  }, []);

  return detectLocation;
};

export default useDetectLocation;
