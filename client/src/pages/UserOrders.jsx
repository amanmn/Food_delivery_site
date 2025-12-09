import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const UserOrders = ({ orders = [], filter }) => {
  const navigate = useNavigate();

  if (!Array.isArray(orders)) return null;

  // Filter orders based on shopOrder status
  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) =>
        order.shopOrders?.some(
          (shopOrder) =>
            shopOrder.status?.toLowerCase() === filter.toLowerCase()
        )
      );

  if (filteredOrders.length === 0)
    return (
      <div className="text-center text-gray-500 mt-20">
        <p className="text-lg sm:text-xl">No {filter} orders found 🛍️</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredOrders.map((order) => {
        // Calculate main status for this order
        const mainStatus =
          order.shopOrders?.[0]?.status || "unknown";

        return (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
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
                className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full ${mainStatus === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : mainStatus === "delivered"
                    ? "bg-green-100 text-green-700"
                    : mainStatus === "preparing"
                      ? "bg-blue-100 text-blue-700"
                      : mainStatus === "out_for_delivery"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
              >
                {mainStatus.charAt(0).toUpperCase() + mainStatus.slice(1)}
              </span>
            </div>

            {/* ===== Order Items ===== */}
            <div className="p-5 flex-1">
              {order.shopOrders?.map((shopOrder) => (
                <div key={shopOrder._id} className="mb-5">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    🏪 {shopOrder.shop?.name || "Shop"}
                  </h4>
                  <div className="space-y-3">
                    {shopOrder.shopOrderItems?.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center bg-gray-50 rounded-2xl p-2.5 hover:bg-gray-100 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item?.image ||
                              item?.item?.image ||
                              "https://via.placeholder.com/50?text=Food"
                            }
                            alt={item?.name || item?.item?.name}
                            className="w-14 h-14 rounded-xl object-cover border"
                          />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {item?.name || item?.item?.name}
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
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-5 py-4 flex flex-row sm:flex-row justify-between items-center gap-3 bg-gray-50">
              <div className="flex flex-col items-start">
                <p className="text-sm text-gray-600">
                  Payment:{" "}
                  <span
                    className={`font-semibold ${order.paymentStatus === "pending"
                      ? "text-yellow-600"
                      : "text-green-600"
                      }`}
                  >
                    {order.paymentStatus
                      ? order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)
                      : "Unknown"}
                  </span>
                </p>
                <p className="text-lg font-semibold text-green-700">
                  ₹{order.totalAmount}
                </p>
              </div>

              {/* Track Order Button */}
              <button
                onClick={() => navigate(`/track-order/${order._id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-md transition-all duration-200"
              >
                🚚 Track Order
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserOrders;
