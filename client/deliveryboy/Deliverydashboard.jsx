import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    User,
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    Truck,
    LogOut,
} from "lucide-react";
import { userLoggedOut } from "../src/redux/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutUserMutation } from "../src/redux/features/auth/authApi";
import { MdEmail } from "react-icons/md";
import { useGetDeliveryBoyAssignmentsQuery } from "../src/redux/features/order/orderApi";

const DeliveryDashboard = ({ deliveryBoy }) => {
    const dispatch = useDispatch();
    const [broadcastedOrders, setBroadcastedOrders] = useState([]);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logoutUser] = useLogoutUserMutation();

    // const assignments = useSelector(state => state.order)
    const { data, refetch, isLoading } = useGetDeliveryBoyAssignmentsQuery();

    useEffect(() => {
        console.log(deliveryBoy);
        console.log(data);
        setLoading(false);
    }, [deliveryBoy]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(userLoggedOut());
        } catch (error) {
            console.error("Logout failed:", err);
        }
    }
    if (loading) {
        return (
            <p className="text-center mt-20 text-gray-500 text-lg">
                Loading dashboard...
            </p>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">

            {/* TOP PROFILE CARD */}
            <div className="bg-white shadow rounded-xl p-4 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold">
                        {deliveryBoy?.profilePicture}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {deliveryBoy?.name}
                        </h2>
                        <p className="text-gray-600 flex items-center gap-2">
                            <Phone size={16} /> {deliveryBoy?.phone}
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                            <MdEmail size={16} /> {deliveryBoy?.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {/* DASHBOARD SECTIONS */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* BROADCASTED ORDERS */}
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        Broadcasted Orders
                    </h3>

                    {broadcastedOrders.length === 0 ? (
                        <p className="text-gray-500 text-sm">No new requests</p>
                    ) : (
                        broadcastedOrders.map((order) => (
                            <div
                                key={order._id}
                                className="p-3 border rounded-lg mb-3 bg-gray-50"
                            >
                                <p className="font-semibold">
                                    Order #{order._id.slice(-5)}
                                </p>

                                <p className="text-sm text-gray-600 flex gap-2 items-center">
                                    <MapPin size={14} /> {order.deliveryAddress?.text}
                                </p>

                                <button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-lg">
                                    Accept Delivery
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* ASSIGNED ORDERS */}
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Truck size={18} className="text-orange-500" />
                        Assigned Deliveries
                    </h3>

                    {assignedOrders.length === 0 ? (
                        <p className="text-gray-500 text-sm">No assigned orders</p>
                    ) : (
                        assignedOrders.map((order) => (
                            <div
                                key={order._id}
                                className="p-3 border rounded-lg mb-3 bg-gray-50"
                            >
                                <p className="font-semibold">
                                    Order #{order._id.slice(-5)}
                                </p>

                                <p className="text-sm text-gray-600 flex gap-2 items-center">
                                    <MapPin size={14} /> {order.deliveryAddress?.text}
                                </p>

                                <button className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg">
                                    Mark as Delivered
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* COMPLETED ORDERS */}
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-600" />
                        Completed Deliveries
                    </h3>

                    {completedOrders.length === 0 ? (
                        <p className="text-gray-500 text-sm">No completed deliveries yet</p>
                    ) : (
                        completedOrders.map((order) => (
                            <div
                                key={order._id}
                                className="p-3 border rounded-lg mb-3 bg-green-50"
                            >
                                <p className="font-semibold">
                                    Order #{order._id.slice(-5)}
                                </p>

                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <MapPin size={14} /> {order.deliveryAddress?.text}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
