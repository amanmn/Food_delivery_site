import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetOrderItemsQuery,
  useUpdateOrderStatusMutation,
} from "../../src/redux/features/order/orderApi";
import { useGetDeliveryBoysQuery } from "../../src/redux/features/user/userApi";
import DeliveryBoyList from "../../deliveryboy/DeliveryBoyList";
import { FaBackwardStep } from "react-icons/fa6";
import { useAssignDeliveryBoyMutation } from "../../src/redux/features/order/orderApi";

const OwnerOrders = ({ orders = [], filter }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSelector((state) => state.user);

  const ownerId = user?._id;

  const [localOrders, setLocalOrders] = useState([]);
  const [updating, setUpdating] = useState(null);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useGetOrderItemsQuery(undefined, {
    skip: !ownerId,
  });

  // const [assignDeliveryBoy, { isLoading: assigning }] =
  //   useAssignDeliveryBoyMutation();

  console.log("Orders Data from API:", ordersData);

  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  // Load orders from API
  // const localOrders = ordersData?.orders || [];

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      refetch();
    };
    socket.on("orderAssigned", handleUpdate);
    socket.on("update-status", handleUpdate);

    return () => {
      socket.off("orderAssigned", handleUpdate);
      socket.off("update-status", handleUpdate);
    };
  }, [socket, refetch]);

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <p>Loading orders...</p>
      </div>
    );
  }

  // Filter orders for this owner
  const ownerOrders = localOrders
    .map((order) => ({
      ...order,
      shopOrders: order.shopOrders?.filter(
        (shopOrder) =>
          shopOrder?.owner === ownerId ||
          shopOrder?.owner?._id === ownerId
      ),
    }))
    .filter((order) => order.shopOrders && order.shopOrders.length > 0);

  const safeFilter = filter?.toLowerCase() ?? "all";

  const filteredOrders =
    safeFilter === "all"
      ? ownerOrders
      : ownerOrders.filter((order) =>
        order.shopOrders.some(
          (so) =>
            so.status &&
            so.status.toLowerCase() === safeFilter
        )
      );

  const handleStatusChange = async (orderId, shopOrderId, newStatus) => {
    setUpdating(shopOrderId);

    try {
      const res = await updateOrderStatus({
        orderId,
        shopOrderId,
        status: newStatus,
      }).unwrap();

      if (res.success) {
        refetch();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <p>No {(filter ?? "all").toLowerCase()} shop orders found</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dash")}
            className="px-3 py-2 bg-white shadow rounded-lg hover:shadow-md"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Orders Dashboard
          </h1>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm">
          Total Orders: <span className="font-semibold">{filteredOrders.length}</span>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-6">

        {filteredOrders.map((order) => {
          const shopOrder = order.shopOrders[0];

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-5"
            >

              {/* TOP SECTION */}
              <div className="flex justify-between items-center border-b pb-3 mb-4">

                {/* ORDER INFO */}
                <div>
                  <p className="font-semibold text-gray-800">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* PAYMENT STATUS */}
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">
                    {order.paymentMethod}
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                      }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

              </div>

              {/* MAIN GRID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* CUSTOMER */}
                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="font-medium">{order.user?.name}</p>
                  <p className="text-xs text-gray-500">{order.user?.phone}</p>
                </div>

                {/* ITEMS */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Items</p>
                  <div className="space-y-2">
                    {shopOrder.shopOrderItems?.map((item) => (
                      <div key={item._id} className="flex items-center gap-2">
                        <img
                          src={item?.item?.image}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="text-xs">
                          <p>{item?.item?.name}</p>
                          <p className="text-gray-400">× {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>

                  <select
                    value={shopOrder.status}
                    disabled={updating === shopOrder._id}
                    onChange={(e) =>
                      handleStatusChange(
                        order._id,
                        shopOrder._id,
                        e.target.value
                      )
                    }
                    className="border px-3 py-1 rounded-md text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>

                  <p className="text-green-600 font-semibold mt-2">
                    ₹{shopOrder.subtotal}
                  </p>
                </div>

                {/* DELIVERY */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Delivery</p>

                  {/* ASSIGNED */}
                  {shopOrder.assignedDeliveryBoy ? (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-semibold text-green-700 text-sm">
                        {shopOrder.assignedDeliveryBoy.fullName ||
                          shopOrder.assignedDeliveryBoy.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {shopOrder.assignedDeliveryBoy.phone}
                      </p>
                    </div>
                  ) : shopOrder.status === "out_for_delivery" ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">

                      {shopOrder.availableBoys?.length > 0 ? (
                        shopOrder.availableBoys.map((boy) => (
                          <div
                            key={boy.id}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded-lg hover:bg-gray-100"
                          >
                            <div>
                              <p className="text-xs font-medium">
                                {boy.fullName}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {boy.phone}
                              </p>
                            </div>

                            {/* <button
                              disabled={assigning}
                              onClick={() =>
                                handleAssignBoy(
                                  order._id,
                                  shopOrder._id,
                                  boy.id
                                )
                              }
                              className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600"
                            >
                              {assigning ? "Assigning..." : "Assign"}
                            </button> */}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">
                          No delivery boys nearby
                        </p>
                      )}

                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Not assigned yet
                    </p>
                  )}
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OwnerOrders;
