import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedOut } from "../src/redux/features/auth/authSlice";
import { useLogoutUserMutation } from "../src/redux/features/auth/authApi";
import {
  useGetDeliveryBoyAssignmentsQuery,
  useAcceptDeliveryAssignmentMutation,
  useSendDeliveryOtpMutation,
  useVerifyDeliveryOtpMutation,
} from "../src/redux/features/order/orderApi";
import ActiveDeliveryScreen from "./ActiveDeliveryScreen";
import AvailableOrdersScreen from "./AvailableOrdersScreen";
import DeliveryHeader from "./DeliveryHeader";
import StatsSection from "./StatsSection";
import { useGetDeliveryStatsQuery } from "../src/redux/features/order/orderApi";

const DeliveryDashboard = ({ deliveryBoy }) => {
  const dispatch = useDispatch();
  const { socket } = useSelector((state) => state.user);

  const { data: assignments = [], refetch } = useGetDeliveryBoyAssignmentsQuery();
  console.log("Current Assignments:", assignments);
  const { data: stats } = useGetDeliveryStatsQuery();

  const [logoutUser] = useLogoutUserMutation();
  const [acceptAssignment] = useAcceptDeliveryAssignmentMutation();
  const [sendDeliveryOtp] = useSendDeliveryOtpMutation();
  const [verifyDeliveryOtp] = useVerifyDeliveryOtpMutation();

  const [otpBox, setOtpBox] = useState(null);
  const [otp, setOtp] = useState("");

  // Split data
  const assigned = assignments.filter(
    (o) => o.status === "assigned"
  );
  const activeOrder = assigned.length > 0 ? assigned[0] : null;
  const broadcasted = assignments.filter(o => o.status === "broadcasted");
  const completed = assignments.filter(o => o.status === "completed");

  // SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    const handleNewBroadcast = (data) => {
      console.log("📦 New order for delivery:", data);
      refetch(); // refresh list
    };

    const handleAssignmentUpdate = (data) => {
      console.log("📦 Assignment update:", data);
      refetch();
    };

    const handleOrderCompleted = () => {
      setOtpBox(null);
      setOtp("");
      refetch();
    };
    const handleAssignmentCancelled = () => {
      setOtpBox(null);
      setOtp("");
      refetch();
    };

    socket.on("newBroadcastOrder", handleNewBroadcast);
    socket.on("orderAssigned", handleAssignmentUpdate);
    socket.on("orderCompleted", handleOrderCompleted);
    socket.on("assignmentCancelled", handleAssignmentCancelled);

    return () => {
      socket.off("newBroadcastOrder", handleNewBroadcast);
      socket.off("orderAssigned", handleAssignmentUpdate);
      socket.off("orderCompleted");
      socket.off("assignmentCancelled", handleAssignmentCancelled);
    };
  }, [socket, refetch]);

  // ACTIONS
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
    try {
      const res = await verifyDeliveryOtp({
        orderId: order.orderId,
        shopOrderId: order.shopOrderId,
        otp,
      }).unwrap(); // 🔥 IMPORTANT

      if (res.success) {
        setOtpBox(null);
        setOtp("");
        refetch();
        return true;
      }

      return false;
    } catch (err) {
      console.error("OTP Error:", err);
      return false;
    }
  };

  return (
    <>
      <DeliveryHeader
        deliveryBoy={deliveryBoy}
        onLogout={handleLogout}
      />

      {activeOrder ? (
        <ActiveDeliveryScreen
          order={activeOrder}
          deliveryBoy={deliveryBoy}
          onSendOtp={handleSendOtp}
          onVerifyOtp={handleVerifyOtp}
          otp={otp}
          setOtp={setOtp}
          otpBox={otpBox}
        />) : (
        <>
          <StatsSection stats={stats} />

          <AvailableOrdersScreen
            orders={broadcasted}
            onAccept={handleAccept}
          />
        </>
      )}
    </>
  );
}

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-3 sm:p-6">
//       {/* 🔥 HEADER */}
//       <div className="bg-white rounded-2xl shadow p-4 flex justify-between items-center mb-4">

//         <div className="flex gap-3 items-center">
//           <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold">
//             {deliveryBoy?.name?.charAt(0)}
//           </div>

//           <div>
//             <h2 className="text-base font-semibold">{deliveryBoy?.name}</h2>
//             <p className="text-xs text-gray-500">{deliveryBoy?.phone}</p>
//           </div>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="bg-red-500 text-white px-3 py-1.5 text-sm rounded-lg"
//         >
//           Logout
//         </button>
//       </div>

//       {activeOrder && (
//         <div className="mb-4">
//           <DeliveryBoyTracking
//             data={activeOrder}
//             deliveryBoy={deliveryBoy}
//           />
//         </div>
//       )}

//       {/* 🔥 STATS */}
//       <div className="grid grid-cols-3 gap-3 mb-4">
//         <StatCard title="New Orders" value={broadcasted.length} icon={<Clock />} color="blue" />
//         <StatCard title="Active" value={assigned.length} icon={<Truck />} color="orange" />
//         <StatCard title="Completed" value={completed.length} icon={<CheckCircle />} color="green" />
//       </div>

//       {/* 🔥 TABS */}
//       <div className="flex gap-2 mb-3 sticky top-0 bg-gray-100 py-2 z-10">        {["broadcasted", "assigned", "completed"].map((tab) => (
//         <button
//           key={tab}
//           onClick={() => setActiveTab(tab)}
//           className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === tab
//             ? "bg-blue-500 text-white"
//             : "bg-white shadow text-gray-600"
//             }`}
//         >
//           {tab.toUpperCase()}
//         </button>
//       ))}
//       </div>

//       {/* 🔥 CARDS */}
//       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">        {currentData.length === 0 ? (
//         <p className="text-gray-500 text-center">No orders</p>
//       ) : (
//         currentData.map((order) => (
//           <div
//             key={order.assignmentId}
//             className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
//           >
//             {/* HEADER */}
//             <div className="flex justify-between mb-2">
//               <h3 className="font-bold">
//                 #{order.assignmentId.slice(-5)}
//               </h3>

//               <StatusBadge status={order.status} />
//             </div>

//             {/* ADDRESS */}
//             <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
//               <MapPin size={14} />
//               {order.deliveryAddress?.text}
//             </p>

//             {/* ACTIONS */}
//             {activeTab === "broadcasted" && (
//               <button
//                 onClick={() => handleAccept(order.assignmentId)}
//                 className="w-full bg-blue-500 text-white py-2 rounded-lg"
//               >
//                 Accept Delivery
//               </button>
//             )}

//             {activeTab === "assigned" && (
//               <>
//                 {otpBox !== order.assignmentId ? (
//                   <button
//                     onClick={() => handleSendOtp(order)}
//                     className="w-full bg-green-500 text-white py-2 rounded-lg"
//                   >
//                     Mark Delivered
//                   </button>
//                 ) : (
//                   <div className="mt-3">
//                     <input
//                       value={otp}
//                       onChange={(e) => setOtp(e.target.value)}
//                       placeholder="Enter OTP"
//                       className="w-full border p-2 rounded-lg mb-2"
//                     />
//                     <button
//                       onClick={() => handleVerifyOtp(order)}
//                       className="w-full bg-green-600 text-white py-2 rounded-lg"
//                     >
//                       Confirm
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}

//             {activeTab === "completed" && (
//               <p className="text-green-600 font-semibold text-sm">
//                 ✅ Delivered
//               </p>
//             )}
//           </div>
//         ))
//       )}
//       </div>
//     </div>
//   );

export default DeliveryDashboard;



// 🔥 REUSABLE COMPONENTS

// const StatCard = ({ title, value, icon, color }) => {
//   const colors = {
//     blue: "text-blue-600",
//     orange: "text-orange-500",
//     green: "text-green-600",
//   };

//   return (
//     <div className="bg-white p-4 rounded-xl shadow flex justify-between">
//       <div>
//         <p className="text-gray-500 text-sm">{title}</p>
//         <h2 className={`text-2xl font-bold ${colors[color]}`}>
//           {value}
//         </h2>
//       </div>
//       <div className={colors[color]}>{icon}</div>
//     </div>
//   );
// };

// const StatusBadge = ({ status }) => {
//   const styles = {
//     broadcasted: "bg-blue-100 text-blue-600",
//     assigned: "bg-orange-100 text-orange-600",
//     completed: "bg-green-100 text-green-600",
//   };

//   return (
//     <span className={`text-xs px-3 py-1 rounded-full ${styles[status]}`}>
//       {status}
//     </span>
//   );
// };