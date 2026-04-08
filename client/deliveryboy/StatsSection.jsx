const StatsSection = ({ stats }) => {
    return (
        <div className="grid grid-cols-3 gap-3 mb-3">

            <div className="bg-white p-3 rounded-xl shadow text-center">
                <p className="text-xs text-gray-500">Today</p>
                <h2 className="font-bold text-lg">
                    {stats?.todayDeliveries || 0}
                </h2>
            </div>

            <div className="bg-white p-3 rounded-xl shadow text-center">
                <p className="text-xs text-gray-500">Total</p>
                <h2 className="font-bold text-lg">
                    {stats?.totalDeliveries || 0}
                </h2>
            </div>

            <div className="bg-white p-3 rounded-xl shadow text-center">
                <p className="text-xs text-gray-500">Earnings</p>
                <h2 className="font-bold text-lg text-green-600">
                    ₹{stats?.earnings || 0}
                </h2>
            </div>

        </div>
    );
};

export default StatsSection;