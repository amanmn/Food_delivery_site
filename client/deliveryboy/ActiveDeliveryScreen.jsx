import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { useState } from "react";

const ActiveDeliveryScreen = ({
    order,
    deliveryBoy,
    onSendOtp,
    onVerifyOtp,
    otp,
    setOtp,
    otpBox,
}) => {
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    return (
        <div className="p-3">

            {/* 🔥 MAP */}
            <DeliveryBoyTracking data={order} deliveryBoy={deliveryBoy} />

            {/* 🔥 ORDER DETAILS */}
            <div className="bg-white p-4 rounded-xl shadow mt-3">
                <h2 className="font-bold text-lg mb-2">
                    Order #{order.assignmentId.slice(-5)}
                </h2>

                <p className="text-sm text-gray-600">
                    📍 {order.deliveryAddress?.text}
                </p>

                <p className="text-sm mt-1">
                    👤 {order.user?.name}
                </p>

                <p className="text-sm">
                    📞 {order.user?.phone}
                </p>
            </div>

            {/* 🔥 DELIVERY ACTION */}
            <div className="mt-4">
                {otpBox !== order.assignmentId ? (
                    <button
                        onClick={() => onSendOtp(order)}
                        className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
                    >
                        Mark Delivered
                    </button>
                ) : (
                    <div>
                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="w-full border p-3 rounded-lg mb-2"
                        />
                        <button
                            disabled={verifying}
                            onClick={async () => {
                                try {
                                    setVerifying(true);

                                    const success = await onVerifyOtp(order);

                                    if (success) {
                                        alert("✅ Delivery confirmed!");
                                    } else {
                                        alert("❌ Invalid OTP");
                                    }

                                } catch (err) {
                                    alert("❌ Something went wrong");
                                } finally {
                                    setVerifying(false);
                                }
                            }}
                            className={`w-full py-3 rounded-xl text-white ${verifying ? "bg-gray-400" : "bg-green-600"
                                }`}
                        >
                            {verifying ? "Verifying..." : "Confirm Delivery"}
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ActiveDeliveryScreen;