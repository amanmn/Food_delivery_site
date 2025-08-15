import { FaShoppingBag, FaDollarSign, FaUsers, FaCheck, FaTimes, FaUtensils } from "react-icons/fa";
import StatCard from "../components/StatsCard";
import OrderCard from "../components/OrderItem";

export default function AdminDashboard() {
    const orders = [
        {
            img: "https://source.unsplash.com/100x100/?burger",
            name: "The Ferns",
            orderId: "#9325032991098408",
            time: "32 seconds ago",
            address: "Royal Epic Park, Rajkot, India",
        },
    ];

    return (
        <div className="space-y-6 mt-5">
            {/* Stats Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard title="Total Orders" value="91" color="bg-yellow-500" border="border-yellow-500" icon={<FaShoppingBag />} />
                <StatCard title="Running Orders" value="55" color="bg-blue-500" border="border-blue-500" icon={<FaUtensils />} />
                <StatCard title="Approved Restaurants" value="14" color="bg-green-500" border="border-green-500" icon={<FaCheck />} />
                <StatCard title="Live Restaurants" value="13" color="bg-purple-500" border="border-purple-500" icon={<FaUsers />} />
                <StatCard title="Cancelled Orders" value="27" color="bg-red-500" border="border-red-500" icon={<FaTimes />} />
                <StatCard title="Earnings" value="$15597.57" color="bg-pink-500" border="border-pink-500" icon={<FaDollarSign />} />
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-100 p-4 rounded-xl space-y-4">
                <h2 className="font-bold text-lg mb-2">Last 7 Days Orders</h2>
                {orders.map((order, idx) => (
                    <OrderCard key={idx} {...order} />
                ))}
            </div>
        </div>
    );
}
