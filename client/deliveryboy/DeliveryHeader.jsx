const DeliveryHeader = ({ deliveryBoy, onLogout, onToggleHistory, showingHistory }) => {
    return (
        <div className="bg-white shadow p-4 flex justify-between items-center">
            <div>
                <h2 className="font-bold text-lg">{deliveryBoy?.name}</h2>
                <p className="text-green-600 text-sm">● Online</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleHistory}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                    {showingHistory ? "Back" : "History"}
                </button>
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