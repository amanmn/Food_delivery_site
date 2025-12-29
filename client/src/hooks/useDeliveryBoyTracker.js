// src/hooks/useDeliveryBoyTracker.js
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setDeliveryLocation, clearDeliveryLocation } from "../redux/features/deliveryBoyLocation/deliveryLocationSlice";
import { toast } from "react-toastify";

const useDeliveryBoyTracker = (role, updateDeliveryLocation) => {
  const dispatch = useDispatch();
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (role !== "deliveryBoy") {
      dispatch(clearDeliveryLocation());
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      return;
    }

    if (!navigator.geolocation) {
      toast.error("❌ Geolocation not supported on this device");
      return;
    }

    const trackLocation = async (pos) => {
      const { latitude, longitude } = pos.coords;
      dispatch(setDeliveryLocation({ lat: latitude, lon: longitude }));

      try {
        await updateDeliveryLocation({
          location: { type: "Point", coordinates: [longitude, latitude] },
        });
      } catch (err) {
        console.error("❌ Error updating backend:", err);
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      trackLocation,
      (err) => {
        if (err.code === 1) toast.error("Please allow location access!");
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [role, updateDeliveryLocation, dispatch]);

};

export default useDeliveryBoyTracker;
