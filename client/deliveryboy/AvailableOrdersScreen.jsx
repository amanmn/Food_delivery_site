const AvailableOrdersScreen = ({ orders, onAccept, onDecline }) => {
    if (!orders || orders.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                No orders available right now
            </div>
        );
    }

    return (
        <div className="p-3 space-y-3">
            {orders.map((order) => (
                <div
                    key={order.assignmentId}
                    className="bg-white rounded-xl shadow p-4 flex flex-col gap-2"
                >
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">
                            {order.shopName}
                        </span>
                        <span className="text-green-600 font-bold">
                            ₹{order.subtotal}
                        </span>
                    </div>

                    <p className="text-sm text-gray-500">
                        📍 {order.deliveryAddress?.text}
                    </p>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => onDecline(order.assignmentId)}
                            className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => onAccept(order.assignmentId)}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AvailableOrdersScreen;