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
import { useGetDashboardStatsQuery } from "../../src/redux/features/shop/shopApi";

export default function AdminDashboard() {
  const { data, isLoading } = useGetDashboardStatsQuery();

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-600">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-3"></div>
        Loading dashboard...
      </div>
    );
  // if (isError || !data) {
  //   return (
  //     <div className="text-center text-red-500 mt-20">
  //       Failed to load dashboard data
  //     </div>
  //   );
  // }

  const {
    totalOrders = 0,
    runningOrders = 0,
    cancelledOrders = 0,
    completedOrders = 0,
    earnings = 0,
    outForDeliveryOrders = 0,
    recentOrders = [],
  } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-10">

      {/* Stats */}
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
          title="Out for Delivery"
          value={outForDeliveryOrders}
          color="bg-gradient-to-r from-orange-400 to-orange-600"
          border="border-orange-400"
          icon={<FaUtensils />}
        />

        <StatCard
          title="Cancelled Orders"
          value={cancelledOrders}
          color="bg-gradient-to-r from-red-400 to-red-600"
          border="border-red-400"
          icon={<FaTimes />}
        />

        <StatCard
          title="Completed Orders"
          value={completedOrders}
          color="bg-gradient-to-r from-green-400 to-green-600"
          border="border-green-400"
          icon={<FaCheck />}
        />

        <StatCard
          title="Earnings"
          value={`₹${earnings.toLocaleString("en-IN")}`}
          color="bg-gradient-to-r from-pink-400 to-pink-600"
          border="border-pink-400"
          icon={<FaDollarSign />}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-5 sm:p-6 border border-gray-100 mt-10">
        <h2 className="font-bold text-xl sm:text-2xl mb-4 text-gray-900">
          📦 Recent Orders
        </h2>

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <OrderCard
                key={order._id}
                id={order._id}
                name={order.user?.name}
                address={order.deliveryAddress?.text}
                time={new Date(order.createdAt).toLocaleString()}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No recent orders yet.
          </p>
        )}
      </div>

      {/* Products */}
      <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-5 sm:p-6 border border-gray-100 mt-10">
        <h2 className="font-bold text-xl sm:text-2xl mb-4 text-gray-900">
          🍔 Products
        </h2>
        <ItemProduct />
      </div>
    </div>
  );
}