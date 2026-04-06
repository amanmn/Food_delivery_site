import { useEffect, useState } from "react";
import {
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  LogOut,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedOut } from "../src/redux/features/auth/authSlice";
import { useLogoutUserMutation } from "../src/redux/features/auth/authApi";
import {
  useGetDeliveryBoyAssignmentsQuery,
  useAcceptDeliveryAssignmentMutation,
  useSendDeliveryOtpMutation,
  useVerifyDeliveryOtpMutation,
} from "../src/redux/features/order/orderApi";

const DeliveryDashboard = ({ deliveryBoy }) => {
  const dispatch = useDispatch();
  const { socket } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("broadcasted");
  const [otpBox, setOtpBox] = useState(null);
  const [otp, setOtp] = useState("");

  const { data: assignments = [], refetch } =
    useGetDeliveryBoyAssignmentsQuery();

  const [logoutUser] = useLogoutUserMutation();
  const [acceptAssignment] = useAcceptDeliveryAssignmentMutation();
  const [sendDeliveryOtp] = useSendDeliveryOtpMutation();
  const [verifyDeliveryOtp] = useVerifyDeliveryOtpMutation();

  // 🔹 Split data
  const broadcasted = assignments.filter((o) => o.status === "broadcasted");
  const assigned = assignments.filter((o) => o.status === "assigned");
  const completed = assignments.filter((o) => o.status === "completed");

  // 🔥 SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    socket.on("newBroadcastOrder", (data) => {
      console.log("🔥 New Order:", data);
      refetch();
    });

    socket.on("orderAssigned", () => {
      refetch();
    });

    return () => {
      socket.off("newBroadcastOrder");
      socket.off("orderAssigned");
    };
  }, [socket]);

  // 🔹 ACTIONS
  const handleLogout = async () => {
    await logoutUser();
    dispatch(userLoggedOut());
  };

  const handleAccept = async (id) => {
    await acceptAssignment(id);
    refetch();
  };

  const handleSendOtp = async (order) => {
    await sendDeliveryOtp(order);
    setOtpBox(order.assignmentId);
  };

  const handleVerifyOtp = async (order) => {
    await verifyDeliveryOtp({ ...order, otp });
    setOtpBox(null);
    setOtp("");
    refetch();
  };

  // 🔹 CURRENT TAB DATA
  const currentData =
    activeTab === "broadcasted"
      ? broadcasted
      : activeTab === "assigned"
      ? assigned
      : completed;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* 🔥 HEADER */}
      <div className="bg-white rounded-2xl shadow p-5 flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xl font-bold">
            {deliveryBoy?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold">{deliveryBoy?.name}</h2>
            <p className="text-sm text-gray-500">{deliveryBoy?.phone}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* 🔥 STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard title="New Orders" value={broadcasted.length} icon={<Clock />} color="blue" />
        <StatCard title="Active" value={assigned.length} icon={<Truck />} color="orange" />
        <StatCard title="Completed" value={completed.length} icon={<CheckCircle />} color="green" />
      </div>

      {/* 🔥 TABS */}
      <div className="flex gap-3 mb-4">
        {["broadcasted", "assigned", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-white shadow text-gray-600"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 🔥 CARDS */}
      <div className="space-y-4">
        {currentData.length === 0 ? (
          <p className="text-gray-500 text-center">No orders</p>
        ) : (
          currentData.map((order) => (
            <div
              key={order.assignmentId}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              {/* HEADER */}
              <div className="flex justify-between mb-2">
                <h3 className="font-bold">
                  #{order.assignmentId.slice(-5)}
                </h3>

                <StatusBadge status={order.status} />
              </div>

              {/* ADDRESS */}
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                <MapPin size={14} />
                {order.deliveryAddress?.text}
              </p>

              {/* ACTIONS */}
              {activeTab === "broadcasted" && (
                <button
                  onClick={() => handleAccept(order.assignmentId)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg"
                >
                  Accept Delivery
                </button>
              )}

              {activeTab === "assigned" && (
                <>
                  {otpBox !== order.assignmentId ? (
                    <button
                      onClick={() => handleSendOtp(order)}
                      className="w-full bg-green-500 text-white py-2 rounded-lg"
                    >
                      Mark Delivered
                    </button>
                  ) : (
                    <div className="mt-3">
                      <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full border p-2 rounded-lg mb-2"
                      />
                      <button
                        onClick={() => handleVerifyOtp(order)}
                        className="w-full bg-green-600 text-white py-2 rounded-lg"
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === "completed" && (
                <p className="text-green-600 font-semibold text-sm">
                  ✅ Delivered
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;



// 🔥 REUSABLE COMPONENTS

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "text-blue-600",
    orange: "text-orange-500",
    green: "text-green-600",
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className={`text-2xl font-bold ${colors[color]}`}>
          {value}
        </h2>
      </div>
      <div className={colors[color]}>{icon}</div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    broadcasted: "bg-blue-100 text-blue-600",
    assigned: "bg-orange-100 text-orange-600",
    completed: "bg-green-100 text-green-600",
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};