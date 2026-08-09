// src/hooks/useDeliveryBoyTracker.js
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setDeliveryLocation, clearDeliveryLocation } from "../redux/features/deliveryBoyLocation/deliveryLocationSlice";
import { toast } from "react-toastify";
import { socket } from "../socket";

const useDeliveryBoyTracker = (role, updateDeliveryLocation) => {
  const dispatch = useDispatch();
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (role !== "deliveryBoy") {
      dispatch(clearDeliveryLocation());

      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      return;
    }

    if (!navigator.geolocation) {
      toast.error("❌ Geolocation not supported on this device");
      return;
    }

    const trackLocation = async (pos) => {
      const { latitude, longitude } = pos.coords;

      // Update Redux
      dispatch(setDeliveryLocation({ lat: latitude, lon: longitude }));

      //  Send live location through Socket.IO
      socket.emit("deliveryLocationUpdate", {
        latitude,
        longitude,
      });
    };

    const handleError = (error) => {
      console.error("❌ Geolocation error:", error);

      if (error.code === 1) {
        toast.error("Please allow location access!");
      } else if (error.code === 2) {
        toast.error("Unable to determine your location.");
      } else if (error.code === 3) {
        toast.error("Location request timed out.");
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      trackLocation,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [role, dispatch]);

};

export default useDeliveryBoyTracker;
