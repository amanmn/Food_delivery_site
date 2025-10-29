import { useDispatch } from "react-redux";
import { setCity, setState, updateSelectedAddress } from "../redux/features/user/userSlice";
import { toast } from "react-toastify";

const useDetectLocation = () => {
  const dispatch = useDispatch();
  const APIKEY = import.meta.env.VITE_GEOAPIKEY;

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${APIKEY}`
          );
          const data = await res.json();
          console.log(data.results);

          const city =
            data.results[0]?.city ||
            data.results[0]?.town ||
            data.results[0]?.village ||
            "Unknown";
          const state = data.results[0]?.state || "Unknown";
          const address = data.results[0]?.address_line2 || data.results[0]?.formatted

          dispatch(setCity(city));
          dispatch(setState(state));
          dispatch(updateSelectedAddress(address))

          toast.success(`Detected: ${city}, ${state}`);
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

  return detectLocation;
};

export default useDetectLocation;
