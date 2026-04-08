const AvailableOrdersScreen = ({ orders, onAccept }) => {
    console.log("🔥 Orders UI:", orders);

    return (
        <div className="p-3">
            <h2 className="font-bold mb-3">Available Orders</h2>

            {!orders || orders.length === 0 ? (
                <p className="text-center text-gray-500">No orders</p>
            ) : (
                orders.map((order) => (
                    <div
                        key={order.assignmentId}
                        className="bg-white p-4 rounded-xl shadow mb-3"
                    >
                        {/* ORDER ID */}
                        <p className="text-sm text-gray-600">
                            Order ID: {order.orderId}
                        </p>

                        <hr className="my-2" />

                        {/* SHOP */}
                        <p className="text-sm font-semibold">
                            🏪 {order.shopName}
                        </p>

                        {/* AMOUNT */}
                        <p className="text-sm font-bold text-green-600">
                            ₹ {order.subtotal}
                        </p>

                        {/* ADDRESS */}
                        <p className="text-sm">
                            📍 {order.deliveryAddress?.text}
                        </p>

                        {/* STATUS */}
                        <p className="text-xs text-blue-500 mt-1">
                            {order.status}
                        </p>

                        {/* BUTTON */}
                        <button
                            onClick={() => onAccept(order.assignmentId)}
                            className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg"
                        >
                            Accept Order
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default AvailableOrdersScreen;