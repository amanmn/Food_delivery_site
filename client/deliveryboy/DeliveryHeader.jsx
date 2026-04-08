const DeliveryHeader = ({ deliveryBoy, onLogout }) => {
    return (
        <div className="bg-white shadow p-3 flex justify-between items-center rounded-xl mb-3">

            {/* LEFT */}
            <div>
                <h2 className="font-bold text-md">
                    {deliveryBoy?.name || "Delivery Boy"}
                </h2>
                <p className="text-xs text-gray-500">
                    {deliveryBoy?.phone}
                </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
                <span className="text-green-600 text-xs font-semibold">
                    ● Online
                </span>

                <button
                    onClick={onLogout}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                    Logout
                </button>
            </div>

        </div>
    );
};

export default DeliveryHeader;