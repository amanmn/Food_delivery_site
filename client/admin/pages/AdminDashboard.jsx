import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";


export default function AdminDashboard({ shopData }) {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    useEffect(() => {
        console.log(shopData);
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
    }, [shopData]);

    if (!dashboardData)
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-gray-600">
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
        products,
    } = dashboardData;

    const shopItems = shopData?.items || [];

    return (
        <div className="space-y-8 mt-6 px-2 sm:px-4 md:px-6">
            {/* ===== Stats Section ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
                <StatCard title="Total Orders" value={totalOrders} color="bg-yellow-500" border="border-yellow-500" icon={<FaShoppingBag />} />
                <StatCard title="Running Orders" value={runningOrders} color="bg-blue-500" border="border-blue-500" icon={<FaUtensils />} />
                <StatCard title="Approved Restaurants" value={approvedRestaurants} color="bg-green-500" border="border-green-500" icon={<FaCheck />} />
                <StatCard title="Live Restaurants" value={liveRestaurants} color="bg-purple-500" border="border-purple-500" icon={<FaUsers />} />
                <StatCard title="Cancelled Orders" value={cancelledOrders} color="bg-red-500" border="border-red-500" icon={<FaTimes />} />
                <StatCard title="Earnings" value={`$${earnings}`} color="bg-pink-500" border="border-pink-500" icon={<FaDollarSign />} />
            </div>

            {/* ===== Recent Orders Section ===== */}
            <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
                <h2 className="font-bold text-xl mb-4 text-gray-900">📦 Recent Orders</h2>
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
            <div className="bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-xl text-gray-900">🍽️ Your Products</h2>
                    <button 
                    onClick={()=>navigate("/add-food-item")}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                        + Add New
                    </button>
                </div>

                {shopItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {shopItems.map((item) => (
                            <div
                                key={item._id}
                                className="bg-gray-50 border rounded-xl overflow-hidden shadow hover:shadow-md transition"
                            >
                                <img
                                    src={item.image || "https://source.unsplash.com/400x300/?food"}
                                    alt={item.name}
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4 space-y-2">
                                    <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.category || "Uncategorized"}</p>
                                    <p className="font-bold text-gray-800">₹{item.price || 0}</p>
                                    <span
                                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${item.available
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {item.available ? "Available" : "Unavailable"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No Products added yet.</p>
                )}
            </div>
        </div>
    );
}
