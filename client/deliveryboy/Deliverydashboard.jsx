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

  useEffect(() => {
    if (!socket) return;

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;

        socket.emit("deliveryLocationUpdate", {
          latitude,
          longitude,
        })
      },
        (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };

  }, [socket, deliveryBoy._id]);

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

export default DeliveryDashboard;