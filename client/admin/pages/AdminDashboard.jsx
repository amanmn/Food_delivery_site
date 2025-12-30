import { useEffect, useState } from "react";
import {
  FaShoppingBag,
  FaDollarSign,
  FaUsers,
  FaCheck,
  FaTimes,
  FaUtensils,
} from "react-icons/fa";
import StatCard from "../components/StatsCard";
import OrderCard from "../components/OrderItem";
import ItemProduct from "./ItemProduct";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Simulate fetching data
    setDashboardData({
      totalOrders: 91,
      runningOrders: 55,
      approvedRestaurants: 14,
      liveRestaurants: 13,
      cancelledOrders: 27,
      earnings: 15597.57,
      recentOrders: [
        {
          id: 1,
          img: "https://source.unsplash.com/100x100/?burger",
          name: "The Ferns",
          orderId: "#9325032991098408",
          time: "32 seconds ago",
          address: "Royal Epic Park, Rajkot, India",
        },
      ],
    });
  }, []);

  if (!dashboardData)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-600">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-3"></div>
        Loading dashboard...
      </div>
    );

  const {
    totalOrders,
    runningOrders,
    approvedRestaurants,
    liveRestaurants,
    cancelledOrders,
    earnings,
    recentOrders,
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-10">

      {/* ===== Stats Section ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          color="bg-gradient-to-r from-yellow-400 to-yellow-500"
          border="border-yellow-400"
          icon={<FaShoppingBag />}
        />
        <StatCard
          title="Running Orders"
          value={runningOrders}
          color="bg-gradient-to-r from-blue-400 to-blue-600"
          border="border-blue-400"
          icon={<FaUtensils />}
        />
        <StatCard
          title="Approved Restaurants"
          value={approvedRestaurants}
          color="bg-gradient-to-r from-green-400 to-green-600"
          border="border-green-400"
          icon={<FaCheck />}
        />
        <StatCard
          title="Live Restaurants"
          value={liveRestaurants}
          color="bg-gradient-to-r from-purple-400 to-purple-600"
          border="border-purple-400"
          icon={<FaUsers />}
        />
        <StatCard
          title="Cancelled Orders"
          value={cancelledOrders}
          color="bg-gradient-to-r from-red-400 to-red-600"
          border="border-red-400"
          icon={<FaTimes />}
        />
        <StatCard
          title="Earnings"
          value={`₹${earnings.toLocaleString("en-IN")}`}
          color="bg-gradient-to-r from-pink-400 to-pink-600"
          border="border-pink-400"
          icon={<FaDollarSign />}
        />
      </div>

      {/* ===== Recent Orders Section ===== */}
      <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-5 sm:p-6 border border-gray-100 mt-10">
        <h2 className="font-bold text-xl sm:text-2xl mb-4 text-gray-900 flex items-center gap-2">
          📦 Recent Orders
        </h2>
        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} {...order} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent orders yet.</p>
        )}
      </div>

      {/* ===== Products Section ===== */}
      <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-5 sm:p-6 border border-gray-100 mt-10">
        <h2 className="font-bold text-xl sm:text-2xl mb-4 text-gray-900 flex items-center gap-2">
          🍔 Products
        </h2>
        <ItemProduct />
      </div>
    </div>
  );
}
