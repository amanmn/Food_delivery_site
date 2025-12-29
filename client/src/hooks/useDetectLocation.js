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
          console.log("address", data.results[0]);

          const city = data.results[0]?.city || data.results[0]?.county || "Unknown";
          console.log("city", city);
          const state = data.results[0]?.state || "Unknown";
          const address = data.results[0]?.address_line2 || data.results[0]?.formatted

          dispatch(setCity(city));
          dispatch(setState(state));
          dispatch(updateSelectedAddress(address))
          dispatch(setAddress(data?.results[0].address_line2))

          toast.success(`Location detected ${city}`);
        } catch (error) {
          console.error("Location fetch failed:", error);
          toast.error("Failed to detect location");
        }
      },
      // async (error) => {
      //   toast.error("Location access denied");

      async (error) => {
        toast.error("Location access denied, using fallback");

        // Fallback: IP-based location
        try {
          const res = await fetch(`https://api.geoapify.com/v1/ipinfo?&apiKey=${APIKEY}`);
          const data = await res.json();
          console.log("Fallback IP location:", data);
        } catch (fallbackErr) {
          console.error("Fallback fetch failed:", fallbackErr);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

useEffect(() => {
  if (!city) {
    detectLocation()
  }
}, [city]);

return detectLocation;
};

export default useDetectLocation;
