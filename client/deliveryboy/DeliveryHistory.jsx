import { useGetDeliveryHistoryQuery } from "../src/redux/features/order/orderApi";

const DeliveryHistory = () => {
  const { data, isLoading, isError } = useGetDeliveryHistoryQuery();
  const history = data?.history || [];

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading history...</div>;
  }
  if (isError) {
    return <div className="p-4 text-center text-gray-500">Failed to load history.</div>;
  }
  if (history.length === 0) {
    return <div className="p-4 text-center text-gray-500">No completed deliveries yet.</div>;
  }

  const totalEarnings = history.reduce((sum, h) => sum + h.earning, 0);

  return (
    <div className="p-3">
      <div className="bg-white rounded-xl shadow p-4 mb-3 flex justify-between items-center">
        <span className="text-gray-600 text-sm">Total from these deliveries</span>
        <span className="text-green-600 font-bold text-lg">₹{totalEarnings}</span>
      </div>

      <div className="space-y-2">
        {history.map((h) => (
          <div key={h.assignmentId} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">{h.shopName}</span>
              <span className="text-green-600 font-bold">+₹{h.earning}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {h.completedAt ? new Date(h.completedAt).toLocaleString("en-IN") : ""}
            </p>
            <p className="text-sm text-gray-500 mt-1">📍 {h.deliveryAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryHistory;