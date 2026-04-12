import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer, useMap, Popup, Polyline } from "react-leaflet";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";


const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [35, 35],
    iconAnchor: [17, 46]
})
const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [35, 35],
    iconAnchor: [17, 46]
})

const DeliveryBoyTracking = ({ data, deliveryBoy }) => {
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const { socket } = useSelector((state) => state.user);

    console.log("Tracking Data:", data);

    useEffect(() => {
        if (!socket) return;

        socket.on("deliveryLocationUpdate", (data) => {
            console.log("📍 Live Location:", data);
            setDeliveryLocation(data);
        });

        return () => socket.off("deliveryLocationUpdate");
    }, [socket]);

    const deliveryBoyLat = deliveryLocation?.lat || deliveryBoy?.location?.coordinates[1] || 0
    const deliveryBoyLon = deliveryLocation?.lon || deliveryBoy?.location?.coordinates[0] || 0

    const customerLat = data?.deliveryAddress?.latitude || 0
    const customerLon = data?.deliveryAddress?.longitude || 0

    const path = [
        [deliveryBoyLat, deliveryBoyLon],
        [customerLat, customerLon]
    ]

    const center = [
        (deliveryBoyLat + customerLat) / 2, (deliveryBoyLon + customerLon) / 2

    ]

    return (
        <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
            <MapContainer
                center={center}
                zoom={16}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* <RecenterMap location={location} /> */}
                <Marker draggable position={[deliveryBoyLat, deliveryBoyLon]} icon={deliveryBoyIcon}  >
                    <Popup>Delivery Boy</Popup>
                </Marker>

                <Marker position={[customerLat, customerLon]} icon={customerIcon}>
                    <Popup>Customer</Popup>
                </Marker>
                <Polyline positions={path} color="blue" weight={4} />
            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
