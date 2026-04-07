export default function OrderCard({ amount, name, id, time, address }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg shadow-md p-4 w-full">
      {/* <img src={img} alt={name} className="w-16 h-16 object-cover rounded" /> */}
      <div className="flex-1">
        <h3 className="font-bold">Name: {name}</h3>

        <p className="text-xs font-bold text-blue-500">Amount: {amount}</p>
        <p className="text-xs text-gray-500">Order for: {id}</p>
        <p className="text-xs text-red-500">Time: {time}</p>
        <p className="text-xs text-gray-400">Address: {address}</p>
      </div>
    </div>
  );
}
