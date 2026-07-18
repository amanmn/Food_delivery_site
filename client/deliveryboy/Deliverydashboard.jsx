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
import { socket } from "../src/socket";
import useSocketEvent from "../src/hooks/useSocketEvent";

const DeliveryDashboard = ({ deliveryBoy }) => {
  const dispatch = useDispatch();

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
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("deliveryLocationUpdate", { latitude, longitude });
      }, (error) => {
        console.error("Geolocation error:", error);
      }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      });
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [deliveryBoy._id]);


  // SOCKET EVENTS
  useSocketEvent("newBroadcastOrder", () => refetch());
  useSocketEvent("orderAssigned", () => refetch());
  useSocketEvent("orderCompleted", () => {
    setOtpBox(null);
    setOtp("");
    refetch();
  });
  useSocketEvent("assignmentCancelled", () => refetch());


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