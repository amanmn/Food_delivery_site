import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoLocationSharp, IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa6";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../redux/features/location/locationSlice";
import { useGetCartItemsQuery } from "../redux/features/cart/cartApi";
import { usePlaceOrderMutation } from "../redux/features/order/orderApi";
import { useGetOrderItemsQuery } from "../redux/features/order/orderApi";
import { clearCart } from "../redux/features/cart/cartSlice";

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { location, address } = useSelector((state) => state.location);
    const order = useGetOrderItemsQuery();
    const user = useSelector((state) => state.auth.user);
    const { data, isError, isLoading } = useGetCartItemsQuery();
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [searchInput, setSearchInput] = useState("");
    const [placeOrder] = usePlaceOrderMutation();
    const APIKEY = import.meta.env.VITE_GEOAPIKEY;

    const position = [location?.lat || 22.7196, location?.lon || 75.8577];

    const calculateTotal = () =>
        data?.items?.reduce(
            (t, i) => t + i.quantity * (i?.product?.price || 0),
            0
        ) || 0;

    const deliveryFee = calculateTotal() > 500 ? 0 : 40;
    const AmountWithDeliveryFee = calculateTotal() + deliveryFee;

    useEffect(() => {
        setSearchInput(address);
        console.log(searchInput);
        console.log(data);
        // console.log(order);
    }, [address, searchInput, data]);

    const getAddressByLatLng = async (lat, lon) => {
        try {
            const res = await fetch(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${APIKEY}`
            );
            const data = await res.json();
            const addr = data.results[0]?.address_line2 || "Unknown location";
            dispatch(setAddress(addr));
        } catch (err) {
            console.error(err);
        }
    };

    const onDragEnd = (e) => {
        const { lat, lng } = e.target._latlng;
        dispatch(setLocation({ lat, lon: lng }));
        getAddressByLatLng(lat, lng);
    };

    function RecenterMap({ location }) {
        const map = useMap();
        if (location?.lat && location?.lon)
            map.setView([location.lat, location.lon], 14, { animate: true });
        return null;
    }

    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            dispatch(setLocation({ lat: coords.latitude, lon: coords.longitude }));
            getAddressByLatLng(coords.latitude, coords.longitude);
        });
    };

    const fetchSearchedAddress = async () => {
        try {
            const res = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
                    searchInput
                )}&apiKey=${APIKEY}`
            );
            const data = await res.json();
            const { lat, lon } = data.features[0]?.properties || {};
            if (lat && lon) dispatch(setLocation({ lat, lon }));
        } catch (err) {
            console.error(err);
        }
    };

    const handlePlaceOrder = async () => {
        if (!address) {
            toast.error("Please select or add an address first.");
            return;
        }

        const orderPayload = {
            cartItems: data,
            paymentMethod,
            totalAmount: AmountWithDeliveryFee,
            deliveryAddress: {
                text: searchInput,
                latitude: location.lat,
                longitude: location.lon
            },
        };

        try {
            const result = await placeOrder(orderPayload).unwrap();

            if (result.success) {
                toast.success("Order placed successfully!");
                dispatch(clearCart);
                navigate("/");
            }
        } catch (err) {
            toast.error("Failed to place order.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Address Section */}

                    <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/cart")}
                                className="p-1 hover:bg-gray-200 rounded-full"
                            >
                                <IoIosArrowRoundBack size={30} />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800">
                                Checkout
                            </h1>
                        </div>
                        <h2 className="font-semibold text-lg flex items-center gap-2 my-4">
                            <IoLocationSharp className="text-red-500" /> Delivery Address
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-3 mb-3">
                            <div className="flex w-full border rounded-lg overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Search your delivery address..."
                                    className="flex-1 p-2 text-base focus:outline-none"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                                <button
                                    onClick={fetchSearchedAddress}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 flex items-center justify-center"
                                >
                                    <IoSearchOutline size={18} />
                                </button>
                            </div>
                            <button
                                onClick={getCurrentLocation}
                                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
                            >
                                <TbCurrentLocation size={18} /> Current
                            </button>
                        </div>

                        <div className="rounded-md overflow-hidden border">
                            <MapContainer
                                center={position}
                                zoom={15}
                                className="w-full h-64 sm:h-72"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <RecenterMap location={location} />
                                <Marker draggable position={position} eventHandlers={{ dragend: onDragEnd }} />
                            </MapContainer>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200">
                        <h2 className="font-semibold text-lg mb-4">Payment Method</h2>

                        <div className="space-y-3">
                            <label
                                className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${paymentMethod === "cod"
                                    ? "border-yellow-500 bg-yellow-50"
                                    : "hover:border-gray-400"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === "cod"}
                                    onChange={() => setPaymentMethod("cod")}
                                />
                                <MdDeliveryDining className="text-gray-700 text-xl" />
                                <span>Cash on Delivery</span>
                            </label>

                            <label
                                className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${paymentMethod === "online"
                                    ? "border-yellow-500 bg-yellow-50"
                                    : "hover:border-gray-400"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === "online"}
                                    onChange={() => setPaymentMethod("online")}
                                />
                                <FaCreditCard className="text-gray-700 text-xl" />
                                <span>Pay Online (UPI / Card)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="max-w-5xl bg-white p-5 rounded-md shadow-md border border-gray-200 h-2/3 sticky top-30">
                    <h2 className="font-semibold text-lg mb-3">Order Summary</h2>
                    <div className="divide-y divide-gray-200 text-sm text-gray-700">
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            data?.items?.map((item, i) => (
                                <div key={i} className="flex justify-between py-1">
                                    <span>
                                        {item.product?.name} × {item.quantity}
                                    </span>
                                    <span>₹{item.product?.price * item.quantity}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <hr className="my-3" />
                    <div className="flex justify-between font-medium">
                        <span>Subtotal</span>
                        <span>₹{calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 text-sm mt-1">
                        <span>Delivery Fee</span>
                        <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-3">
                        <span>Total</span>
                        <span className="text-yellow-600">₹{AmountWithDeliveryFee}</span>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        className="mt-5 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition"
                    >
                        {paymentMethod === "cod" ? "Place your order" : "Pay & Place Order"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
