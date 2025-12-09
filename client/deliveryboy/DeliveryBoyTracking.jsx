import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer, useMap, Popup, Polyline } from "react-leaflet";


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
    console.log("Tracking Data:", data);
    const deliveryBoyLat = deliveryBoy?.location?.coordinates[1] || 0
    const deliveryBoyLon = deliveryBoy?.location?.coordinates[0] || 0

    const customerLat = data?.deliveryAddress?.latitude || 0
    const customerLon = data?.deliveryAddress?.longitude || 0

    const path = [
        [deliveryBoyLat, deliveryBoyLon],
        [customerLat, customerLon]
    ]

    const center = [deliveryBoyLat, deliveryBoyLon]

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
                <Polyline positions={path} color="blue" weight={4}/>
            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
