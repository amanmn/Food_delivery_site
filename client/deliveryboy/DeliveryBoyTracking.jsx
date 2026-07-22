import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, Popup, Polyline } from "react-leaflet";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaMotorcycle, FaHome, FaCircle } from "react-icons/fa";
import useSocketEvent from "../src/hooks/useSocketEvent";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -36],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -36],
});

const DeliveryBoyTracking = ({ data, deliveryBoy }) => {
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  useSocketEvent("deliveryLocationUpdate", (loc) => {
    console.log("📍 Live Location", loc);
    setDeliveryLocation(loc);
  });

  const deliveryBoyLat =
    deliveryLocation?.lat || deliveryBoy?.location?.coordinates[1] || 0;
  const deliveryBoyLon =
    deliveryLocation?.lon || deliveryBoy?.location?.coordinates[0] || 0;

  const customerLat = data?.deliveryAddress?.latitude || 0;
  const customerLon = data?.deliveryAddress?.longitude || 0;

  const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [customerLat, customerLon],
  ];

  const center = [
    (deliveryBoyLat + customerLat) / 2,
    (deliveryBoyLon + customerLon) / 2,
  ];

  // Rough distance in km (Haversine)
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(customerLat - deliveryBoyLat);
  const dLon = toRad(customerLon - deliveryBoyLon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(deliveryBoyLat)) *
      Math.cos(toRad(customerLat)) *
      Math.sin(dLon / 2) ** 2;
  const distanceKm = 2 * R * Math.asin(Math.sqrt(a));
  const etaMin = Math.max(1, Math.round((distanceKm / 25) * 60)); // avg 25km/h

  const isLive = Boolean(deliveryLocation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mt-3"
    >
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isLive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isLive ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-gray-700">
            {isLive ? "Live tracking active" : "Waiting for live updates…"}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 ring-1 ring-orange-200 text-orange-700 font-semibold">
            <FaMotorcycle className="text-orange-500" />
            {distanceKm.toFixed(1)} km
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 ring-1 ring-pink-200 text-pink-700 font-semibold">
            <FaCircle className="text-[6px] text-pink-500" />
            ETA ~{etaMin} min
          </div>
        </div>
      </div>

      {/* Map card */}
      <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-orange-100 bg-white">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-orange-400/20 blur-3xl rounded-full z-[500]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 w-56 h-56 bg-pink-400/20 blur-3xl rounded-full z-[500]" />

        <MapContainer
          center={center}
          zoom={16}
          className="w-full h-full z-[1]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            draggable
            position={[deliveryBoyLat, deliveryBoyLon]}
            icon={deliveryBoyIcon}
          >
            <Popup>
              <div className="font-semibold text-orange-600">
                🛵 Delivery Partner
              </div>
              <div className="text-xs text-gray-600">On the way to you</div>
            </Popup>
          </Marker>

          <Marker position={[customerLat, customerLon]} icon={customerIcon}>
            <Popup>
              <div className="font-semibold text-pink-600">🏠 Your Location</div>
              <div className="text-xs text-gray-600">Delivery destination</div>
            </Popup>
          </Marker>

          <Polyline
            positions={path}
            pathOptions={{
              color: "#ff6b35",
              weight: 5,
              opacity: 0.85,
              dashArray: "10, 8",
            }}
          />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-auto z-[600] flex items-center justify-between sm:justify-end gap-3 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg ring-1 ring-gray-200">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 grid place-items-center text-white text-[10px]">
              <FaMotorcycle />
            </span>
            Rider
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-gray-700">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center text-white text-[10px]">
              <FaHome />
            </span>
            You
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DeliveryBoyTracking;
