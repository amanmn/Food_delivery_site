export default function OrderCard({ img, name, orderId, time, address }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg shadow-md p-4 w-full">
      <img src={img} alt={name} className="w-16 h-16 object-cover rounded" />
      <div className="flex-1">
        <h3 className="font-bold">{name}</h3>
        <p className="text-xs text-gray-500">Order for: {orderId}</p>
        <p className="text-xs text-red-500">{time}</p>
        <p className="text-xs text-gray-400">{address}</p>
      </div>
    </div>
  );
}
