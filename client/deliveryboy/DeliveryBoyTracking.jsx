import scooter from "../assets/scooter.png";
import home from "../assets/home.png";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  Marker,
  TileLayer,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  FaMotorcycle,
  FaHome,
  FaClock,
  FaRoute,
  FaLocationArrow,
} from "react-icons/fa";

import useSocketEvent from "../src/hooks/useSocketEvent";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -38],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -38],
});

const MapBounds = ({
  deliveryLocation,
  customerLocation,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!deliveryLocation || !customerLocation) return;

    const bounds = L.latLngBounds([
      [
        deliveryLocation.lat,
        deliveryLocation.lon,
      ],
      [
        customerLocation.lat,
        customerLocation.lon,
      ],
    ]);

    map.fitBounds(bounds, {
      paddingTopLeft: [40, 100],
      paddingBottomRight: [40, 100],
      maxZoom: 15,
      animate: true,
      duration: 0.8,
    });
  }, [deliveryLocation, customerLocation, map]);

  return null;
};

const MapResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    const resizeMap = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    };

    window.addEventListener("resize", resizeMap);
    resizeMap();

    return () => {
      window.removeEventListener("resize", resizeMap);
    };
  }, [map]);

  return null;
};

const DeliveryBoyTracking = ({ data, deliveryBoy }) => {
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  useSocketEvent("deliveryLocationUpdate", (loc) => {
    if (
      typeof loc?.lat !== "number" ||
      typeof loc?.lon !== "number"
    ) {
      return;
    }

    setDeliveryLocation({
      lat: loc.lat,
      lon: loc.lon,
    });
  });

  const deliveryBoyLat =
    deliveryLocation?.lat ??
    deliveryBoy?.location?.coordinates?.[1] ??
    0;

  const deliveryBoyLon =
    deliveryLocation?.lon ??
    deliveryBoy?.location?.coordinates?.[0] ??
    0;

  const customerLat =
    data?.deliveryAddress?.latitude ?? 0;

  const customerLon =
    data?.deliveryAddress?.longitude ?? 0;

  const validDeliveryLocation =
    deliveryBoyLat !== 0 &&
    deliveryBoyLon !== 0;

  const validCustomerLocation =
    customerLat !== 0 &&
    customerLon !== 0;

  const hasLocations =
    validDeliveryLocation &&
    validCustomerLocation;

  useEffect(() => {
    if (!hasLocations) return;

    const controller = new AbortController();

    const getRoute = async () => {
      try {
        setRouteLoading(true);

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${deliveryBoyLon},${deliveryBoyLat};` +
          `${customerLon},${customerLat}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch route");
        }

        const result = await response.json();

        if (
          result.code !== "Ok" ||
          !result.routes?.length
        ) {
          setRouteCoordinates([]);
          return;
        }

        const route = result.routes[0];

        const coordinates =
          route.geometry.coordinates.map(
            ([longitude, latitude]) => [
              latitude,
              longitude,
            ]
          );

        setRouteCoordinates(coordinates);
        setRouteDistance(route.distance / 1000);
        setRouteDuration(
          Math.max(
            1,
            Math.round(route.duration / 60)
          )
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Route error:", error);
        }
      } finally {
        setRouteLoading(false);
      }
    };

    getRoute();

    return () => {
      controller.abort();
    };
  }, [
    deliveryBoyLat,
    deliveryBoyLon,
    customerLat,
    customerLon,
    hasLocations,
  ]);

  const toRad = (value) =>
    (value * Math.PI) / 180;

  const dLat = toRad(
    customerLat - deliveryBoyLat
  );

  const dLon = toRad(
    customerLon - deliveryBoyLon
  );

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(deliveryBoyLat)) *
      Math.cos(toRad(customerLat)) *
      Math.sin(dLon / 2) ** 2;

  const straightDistance =
    2 *
    6371 *
    Math.asin(Math.sqrt(a));

  const displayDistance =
    routeDistance ?? straightDistance;

  const displayEta =
    routeDuration ??
    Math.max(
      1,
      Math.round(
        (straightDistance / 25) * 60
      )
    );

  const isLive = Boolean(deliveryLocation);

  const center = hasLocations
    ? [
        (deliveryBoyLat + customerLat) / 2,
        (deliveryBoyLon + customerLon) / 2,
      ]
    : [deliveryBoyLat, deliveryBoyLon];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full mt-3 sm:mt-4"
    >
      <div className="w-full flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div
          className={`
            inline-flex w-fit items-center gap-2
            px-3 py-1.5 rounded-full
            text-[11px] sm:text-xs font-semibold
            ${
              isLive
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
            }
          `}
        >
          <span
            className={`
              h-2.5 w-2.5 rounded-full
              ${isLive ? "bg-emerald-500" : "bg-amber-400"}
            `}
          />

          {isLive
            ? "Live tracking active"
            : "Waiting for live updates…"}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 ring-1 ring-orange-200 text-orange-700 text-[11px] sm:text-xs font-semibold whitespace-nowrap">
            <FaMotorcycle className="text-orange-500" />
            {displayDistance.toFixed(1)} km
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 ring-1 ring-pink-200 text-pink-700 text-[11px] sm:text-xs font-semibold whitespace-nowrap">
            <FaClock className="text-pink-500" />
            ETA ~{displayEta} min
          </div>

          {routeLoading && (
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500">
              <FaRoute />
              Updating route...
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full h-[55vh] min-h-[320px] max-h-[560px] overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-lg sm:shadow-xl ring-1 ring-orange-100">
        <div className="pointer-events-none absolute -top-20 -left-20 w-48 h-48 sm:w-64 sm:h-64 bg-orange-400/15 blur-3xl rounded-full z-[400]" />

        <div className="pointer-events-none absolute -bottom-20 -right-20 w-48 h-48 sm:w-64 sm:h-64 bg-pink-400/15 blur-3xl rounded-full z-[400]" />

        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom
          className="w-full h-full"
        >
          <MapResizeHandler />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hasLocations && (
            <MapBounds
              deliveryLocation={{
                lat: deliveryBoyLat,
                lon: deliveryBoyLon,
              }}
              customerLocation={{
                lat: customerLat,
                lon: customerLon,
              }}
            />
          )}

          {validDeliveryLocation && (
            <Marker
              position={[
                deliveryBoyLat,
                deliveryBoyLon,
              ]}
              icon={deliveryBoyIcon}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <div className="font-semibold text-orange-600 text-sm">
                    🛵 Delivery Partner
                  </div>

                  <div className="text-xs text-gray-600 mt-1">
                    {isLive
                      ? "Live location"
                      : "Last known location"}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {validCustomerLocation && (
            <Marker
              position={[
                customerLat,
                customerLon,
              ]}
              icon={customerIcon}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <div className="font-semibold text-pink-600 text-sm">
                    🏠 Your Location
                  </div>

                  <div className="text-xs text-gray-600 mt-1">
                    Delivery destination
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {routeCoordinates.length > 0 && (
            <>
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: "#ffffff",
                  weight: 9,
                  opacity: 0.95,
                }}
              />

              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: "#ff6b35",
                  weight: 5,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </>
          )}
        </MapContainer>

        <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-auto z-[500] flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md px-3 py-2.5 shadow-lg ring-1 ring-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 shrink-0 rounded-full bg-orange-100 grid place-items-center text-orange-600">
              <FaRoute />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 leading-none">
                Delivery route
              </p>

              <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                {displayDistance.toFixed(1)} km
              </p>
            </div>
          </div>

          <div className="h-7 w-px bg-gray-200 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-full bg-pink-100 grid place-items-center text-pink-600">
              <FaClock />
            </div>

            <div>
              <p className="text-[10px] text-gray-500 leading-none">
                ETA
              </p>

              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {displayEta} min
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-auto z-[500] flex items-center justify-center sm:justify-end gap-2 sm:gap-3 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl px-2.5 py-2 shadow-lg ring-1 ring-gray-200">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-700">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 grid place-items-center text-white text-[10px]">
              <FaMotorcycle />
            </span>
            <span>Rider</span>
          </div>

          <div className="h-5 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-700">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center text-white text-[10px]">
              <FaHome />
            </span>
            <span>You</span>
          </div>

          <div className="h-5 w-px bg-gray-200" />

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gray-700">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 grid place-items-center text-white text-[10px]">
              <FaRoute />
            </span>
            <span>Route</span>
          </div>
        </div>

        {isLive && (
          <div className="absolute bottom-[68px] left-3 sm:bottom-[76px] sm:left-4 z-[500] flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold text-white shadow-lg">
            <FaLocationArrow className="text-[9px]" />
            Live
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default DeliveryBoyTracking;
