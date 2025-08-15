export default function StatCard({ title, value, color, icon, border }) {
  return (
    <div className={`flex flex-col justify-between bg-white rounded-lg shadow-md p-4 border-t-4 ${border}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{title}</span>
        <div className={`p-2 rounded-full text-white ${color}`}>
          {icon}
        </div>
      </div>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
