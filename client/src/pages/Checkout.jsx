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
import { usePlaceOrderMutation, useVerifyPaymentMutation } from "../redux/features/order/orderApi";
import { clearCart } from "../redux/features/cart/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { location, address } = useSelector((state) => state.location);
  const { user } = useSelector((state) => state.auth);
  const { data, isError, isLoading } = useGetCartItemsQuery();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [searchInput, setSearchInput] = useState("");
  const [placeOrder] = usePlaceOrderMutation();
  const APIKEY = import.meta.env.VITE_GEOAPIKEY;
  const [verifyPayment] = useVerifyPaymentMutation();

  const position = [location?.lat || 22.7196, location?.lon || 75.8577];

  const calculateTotal = () =>
    data?.items?.reduce((t, i) => t + i.quantity * (i?.product?.price || 0), 0) || 0;

  const deliveryFee = calculateTotal() > 500 ? 0 : 40;
  const AmountWithDeliveryFee = calculateTotal() + deliveryFee;

  useEffect(() => {
    setSearchInput(address);
  }, [address]);

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
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchInput)}&apiKey=${APIKEY}`
      );
      const data = await res.json();
      const { lat, lon } = data.features[0]?.properties || {};
      if (lat && lon) {
        dispatch(setLocation({ lat, lon }));
        await getAddressByLatLng(lat, lon);
      } else {
        toast.error("Location not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("failed to fetch address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      toast.error("Please select or add an address first.");
      return;
    }

    const orderPayload = {
      cartItems: { items: data?.items, user: user._id },
      paymentMethod,
      totalAmount: AmountWithDeliveryFee,
      deliveryAddress: {
        text: searchInput,
        latitude: location.lat,
        longitude: location.lon,
      },
    };

    try {
      const res = await placeOrder(orderPayload).unwrap();

      if (paymentMethod === "cod") {
        if (res.success) {
          toast.success("Order placed successfully!");
          dispatch(clearCart());
          navigate("/");
        }
      } else {
        const { razorOrder, orderId } = res;
        openRazorpayWindow(razorOrder, orderId);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to place order.");
    }
  };

  const openRazorpayWindow = async (razorOrder, orderId) => {
    const options = {
      key: import.meta.env.VITE_TEST_API_KEY,
      amount: razorOrder.amount,
      currency: "INR",
      order_id: razorOrder.id,
      name: "Food Delivery",
      handler: async function (response) {
        try {
          const verifyResponse = await verifyPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            orderId: orderId,
          }).unwrap();

          if (verifyResponse.success) {
            toast.success("Order placed successfully!");
            dispatch(clearCart());
            navigate("/");
          }
        } catch (err) {
          toast.error("Failed to verify payment.");
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7f0] via-[#fff1e6] to-[#ffe8d6] pb-10">
      {/* Header bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-2">
          <button
            onClick={() => navigate("/cart")}
            className="p-1.5 rounded-full hover:bg-orange-100 active:scale-95 transition shrink-0"
          >
            <IoIosArrowRoundBack size={28} className="text-[#ff6b35]" />
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#ff6b35] to-[#e84393] bg-clip-text text-transparent truncate">
            Checkout
          </h1>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
          {/* Address Card */}
          <div className="bg-white/90 backdrop-blur p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_-12px_rgba(255,107,53,0.25)] border border-orange-100">
            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2 mb-4">
              <span className="grid place-items-center h-8 w-8 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#e84393] text-white shrink-0">
                <IoLocationSharp size={16} />
              </span>
              <span className="truncate">Delivery Address</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
              <div className="flex w-full min-w-0 bg-orange-50/60 border border-orange-100 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-[#ff6b35]/40 transition">
                <input
                  type="text"
                  placeholder="Search delivery address..."
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                  onClick={fetchSearchedAddress}
                  className="bg-gradient-to-r from-[#ff6b35] to-[#f7931e] hover:brightness-110 text-white px-4 flex items-center justify-center shrink-0 active:scale-95 transition"
                >
                  <IoSearchOutline size={18} />
                </button>
              </div>
              <button
                onClick={getCurrentLocation}
                className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-full flex items-center gap-2 justify-center text-sm font-semibold shrink-0 active:scale-95 transition"
              >
                <TbCurrentLocation size={18} />
                <span className="whitespace-nowrap">Current</span>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-orange-100 shadow-inner">
              <MapContainer center={position} zoom={15} className="w-full h-56 sm:h-72 md:h-80">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker draggable position={position} eventHandlers={{ dragend: onDragEnd }} />
              </MapContainer>
            </div>

            {address && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-orange-50/70 border border-orange-100">
                <IoLocationSharp className="text-[#ff6b35] shrink-0 mt-0.5" size={16} />
                <p className="text-xs sm:text-sm text-gray-700 break-words min-w-0">{address}</p>
              </div>
            )}
          </div>

          {/* Payment Card */}
          <div className="bg-white/90 backdrop-blur p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_-12px_rgba(255,107,53,0.25)] border border-orange-100">
            <h2 className="font-bold text-base sm:text-lg mb-4">Payment Method</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`relative flex items-center gap-3 border-2 rounded-2xl p-3 sm:p-4 cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-[#ff6b35] bg-gradient-to-br from-orange-50 to-pink-50 shadow-[0_8px_20px_-10px_rgba(255,107,53,0.4)]"
                    : "border-gray-200 hover:border-orange-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-[#ff6b35] shrink-0"
                />
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#f7931e] text-white shrink-0">
                  <MdDeliveryDining size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 truncate">Pay when you receive</p>
                </div>
              </label>

              <label
                className={`relative flex items-center gap-3 border-2 rounded-2xl p-3 sm:p-4 cursor-pointer transition-all ${
                  paymentMethod === "online"
                    ? "border-[#ff6b35] bg-gradient-to-br from-orange-50 to-pink-50 shadow-[0_8px_20px_-10px_rgba(255,107,53,0.4)]"
                    : "border-gray-200 hover:border-orange-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="accent-[#ff6b35] shrink-0"
                />
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#e84393] text-white shrink-0">
                  <FaCreditCard size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">Pay Online</p>
                  <p className="text-xs text-gray-500 truncate">UPI / Card / Wallet</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — SUMMARY */}
        <div className="bg-white/90 backdrop-blur p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_-12px_rgba(255,107,53,0.25)] border border-orange-100 lg:sticky lg:top-24 h-fit">
          <h2 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff6b35]" />
            Order Summary
          </h2>

          <div className="divide-y divide-orange-100 text-sm text-gray-700 max-h-64 overflow-y-auto no-scrollbar">
            {isLoading ? (
              <p className="py-2 text-gray-400">Loading...</p>
            ) : (
              data?.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-3 py-2.5 min-w-0">
                  <span className="flex-1 min-w-0 break-words">
                    <span className="font-medium">{item.product?.name}</span>
                    <span className="text-gray-400"> × {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-900 shrink-0 whitespace-nowrap">
                    ₹{item.product?.price * item.quantity}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="my-4 border-t border-dashed border-orange-200" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold whitespace-nowrap">₹{calculateTotal()}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Delivery Fee</span>
              <span className={`font-semibold whitespace-nowrap ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#e84393] text-white flex justify-between items-center gap-2">
            <span className="font-bold text-sm sm:text-base">Total</span>
            <span className="font-extrabold text-lg sm:text-xl whitespace-nowrap">₹{AmountWithDeliveryFee}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="mt-5 w-full bg-gradient-to-r from-[#ff6b35] via-[#f7931e] to-[#e84393] text-white font-bold py-3.5 rounded-full hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#ff6b35]/40 text-sm sm:text-base"
          >
            {paymentMethod === "cod" ? "Place Your Order →" : "Pay & Place Order →"}
          </button>

          <p className="text-[11px] text-center text-gray-400 mt-3">
            By placing your order, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
