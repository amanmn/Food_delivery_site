import React, { useEffect, useState } from "react";
import { useGetOrderItemsQuery } from "../redux/features/order/orderApi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const OrderForm = () => {
  const { data, isLoading, isError } = useGetOrderItemsQuery();
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    console.log(data, "Fetched Orders Data");
  }, [data]);

  // Handle Loading State
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading your orders...
        </p>
      </div>
    );

  // Handle Error State
  if (isError)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-red-500 text-lg">Failed to load orders ❌</p>
      </div>
    );

  const orders = data?.orders || [];

  // Filter logic
  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.orderStatus === filter.toLowerCase());

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Page Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
        🧾 Your Orders
      </h2>

      {/* Go Back Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          ⬅ Back to Home
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {["All", "Pending", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <AnimatePresence>
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-md hover:shadow-lg border border-gray-100 rounded-2xl p-5 sm:p-6 mb-6 transition-transform hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Order ID:{" "}
                    <span className="text-gray-500 text-sm">{order._id}</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    <span
                      className={`${
                        order.orderStatus === "pending"
                          ? "text-yellow-600"
                          : "text-green-600"
                      } font-medium`}
                    >
                      {order.orderStatus}
                    </span>{" "}
                    | Payment:{" "}
                    <span
                      className={`${
                        order.paymentStatus === "pending"
                          ? "text-yellow-600"
                          : "text-green-600"
                      } font-medium`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
                <div className="mt-3 sm:mt-0">
                  <p className="font-semibold text-lg text-green-700">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600">
                <strong>Delivery Address:</strong> {order.deliveryAddress.street},{" "}
                {order.deliveryAddress.city}, {order.deliveryAddress.state} -{" "}
                {order.deliveryAddress.zipCode}
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                  Items:
                </h4>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.product.image ||
                            "https://via.placeholder.com/50?text=Food"
                          }
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{item.product.price} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-700 font-semibold">
                        ₹{item.product.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 text-right">
                <p className="text-xs text-gray-400">
                  Ordered on:{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No {filter.toLowerCase()} orders found 🛍️</p>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
