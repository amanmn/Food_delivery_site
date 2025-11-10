import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useUpdateOrderStatusMutation } from "../../src/redux/features/order/orderApi";

const OwnerOrders = ({ orders = [], filter }) => {
  const { user } = useSelector((state) => state.user);
  const ownerId = user?._id;
  console.log(orders);

  const [localOrders, setLocalOrders] = useState(orders);
  const [updating, setUpdating] = useState(null);

  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  if (!Array.isArray(localOrders)) return null;

  const ownerOrders = localOrders
    .map((order) => ({
      ...order,
      shopOrders: order.shopOrders?.filter(
        (shopOrder) =>
          shopOrder?.owner === ownerId || shopOrder?.owner?._id === ownerId
      ),
    }))
    .filter((o) => o.shopOrders && o.shopOrders.length > 0);

  const filteredOrders =
    filter === "All"
      ? ownerOrders
      : ownerOrders.filter((o) => o.orderStatus === filter.toLowerCase());

  const handleStatusChange = async (orderId, shopOrderId, newStatus) => {
    try {
      setUpdating(shopOrderId);
      const res = await updateOrderStatus({
        orderId,
        shopOrderId,
        status: newStatus,
      }).unwrap();

      // console.log(res);

      if (res.success) {
        setLocalOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                ...order,
                shopOrders: order.shopOrders.map((so) =>
                  so._id === shopOrderId ? { ...so, status: newStatus } : so
                ),
              }
              : order
          )
        );
      }
    } catch (err) {
      console.error("❌ Error updating order status:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (filteredOrders.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <p className="text-lg sm:text-xl">
          No {filter.toLowerCase()} shop orders found 🏪
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredOrders.map((order) => (
        <motion.div
          key={order._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
        >
          {/* 🧾 Header */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Order ID:{" "}
                  <span className="text-gray-500 font-normal">
                    {order._id.slice(-8).toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>

              <span
                className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full ${order.orderStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : order.orderStatus === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.orderStatus === "accepted"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {order.orderStatus
                  ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)
                  : "Unknown"}
              </span>
            </div>

            {/* ✅ User Details */}
            <div className="mt-3 text-xs sm:text-sm text-gray-700 space-y-1">
              <p>
                👤 <span className="font-medium">Name:</span>{" "}
                {order.user?.name || "N/A"}
              </p>
              <p>
                ✉️ <span className="font-medium">Email:</span>{" "}
                {order.user?.email || "N/A"}
              </p>
              <p>
                📞 <span className="font-medium">Phone:</span>{" "}
                {order.user?.phone || "N/A"}
              </p>
              <p>
                🏠 <span className="font-medium">Address:</span>{" "}
                {order.deliveryAddress?.text ||
                  "N/A"}
              </p>
            </div>
          </div>


          {/* 🏪 Shop Orders */}
          <div className="p-5 flex-1 space-y-6">
            {order.shopOrders?.map((shopOrder) => (
              <div key={shopOrder._id} className="border-b pb-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">
                    🏪 {shopOrder.shop?.name || "Unknown Shop"}
                  </h4>
                  <span className="text-sm text-gray-500">
                    Subtotal: ₹{shopOrder.subtotal}
                  </span>
                </div>

                <div className="space-y-3">
                  {shopOrder.shopOrderItems?.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center bg-gray-50 rounded-2xl p-2.5 hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item?.item?.image ||
                            "https://via.placeholder.com/50?text=Food"
                          }
                          alt={item?.item?.name}
                          className="w-14 h-14 rounded-xl object-cover border"
                        />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {item?.item?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₹{item?.price} × {item?.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-700 text-sm">
                        ₹{item?.price * item?.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 🔽 Status Dropdown */}
                <div className="mt-4 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-600">
                    Status:
                  </label>
                  <select
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    value={shopOrder.status || "aman"}
                    onChange={(e) =>
                      handleStatusChange(order._id, shopOrder._id, e.target.value)
                    }
                    disabled={updating === shopOrder._id}
                  >
                    <option value="pending">Pending</option>
                    {/* <option value="accepted">Accepted</option> */}
                    <option value="preparing">Preparing</option>
                    {/* <option value="ready_for_pickup">Ready for Pickup</option> */}
                    <option value="out_for_delivery">Out for Delivery</option>
                    {/* <option value="delivered">Delivered</option> */}
                    {/* <option value="canceled">Canceled</option> */}
                    {/* <option value="rejected">Rejected</option> */}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* 💰 Footer */}
          <div className="border-t border-gray-100 px-5 py-4 flex justify-between items-center bg-gray-50">
            <p className="text-sm text-gray-600">
              Payment:{" "}
              <span
                className={`font-semibold ${order.paymentStatus === "pending"
                  ? "text-yellow-600"
                  : "text-green-600"
                  }`}
              >
                {order.paymentStatus}
              </span>
            </p>
            <p className="text-lg font-semibold text-green-700">
              ₹{order.totalAmount}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OwnerOrders;
