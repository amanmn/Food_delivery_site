// src/hooks/useDeliveryBoyTracker.js
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setDeliveryLocation, clearDeliveryLocation } from "../redux/features/deliveryBoyLocation/deliveryLocationSlice";
import { toast } from "react-toastify";

const useDeliveryBoyTracker = (role, updateDeliveryLocation) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only run for delivery boys
    if (role !== "deliveryBoy") {
      dispatch(clearDeliveryLocation());
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Check browser support
    if (!navigator.geolocation) {
      toast.error("❌ Geolocation not supported on this device");
      return;
    }

    // Get location logic
    const trackLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const {  latitude, longitude } = pos.coords;
          console.log("📍 Coordinates fetched:", latitude, longitude);

          // ✅ Update Redux
          dispatch(setDeliveryLocation({ lat: latitude, lon: longitude }));

          // ✅ Update backend
          try {
            await updateDeliveryLocation({
              location: {
                type: "Point",
                coordinates: [longitude, latitude], // Mongo expects [lng, lat]
              },
            });
            console.log("✅ Location sent to backend:", longitude, latitude);
          } catch (err) {
            console.error("❌ Error updating backend:", err);
          }
        },
        (err) => {
          console.error("⚠️ Geolocation error:", err);
          if (err.code === 1) toast.error("Please allow location access!");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    trackLocation();
    intervalRef.current = setInterval(trackLocation, 10000);

    return () => clearInterval(intervalRef.current);
  }, [role, updateDeliveryLocation, dispatch]);
};

export default useDeliveryBoyTracker;
