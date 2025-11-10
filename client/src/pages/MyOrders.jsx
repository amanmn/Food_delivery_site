import React, { useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { useGetOrderItemsQuery } from "../redux/features/order/orderApi";
import UserOrders from "./UserOrders";
import OwnerOrders from "../../admin/pages/OwnerOrders";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const { data, isLoading, isError } = useGetOrderItemsQuery();
  const isOwner = user?.role === "owner";
  
  const orders = data?.orders || [];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-gray-500 text-lg animate-pulse">
          Fetching your orders...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-red-500 text-lg">Something went wrong ❌</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-10 px-4 sm:px-8 lg:px-16">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
          {isOwner ? "📦 Shop Orders" : "🧾 Your Orders"}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          ⬅ Back to Home
        </button>
      </div>

      {/* ===== Filter Tabs ===== */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-8">
        {["All", "Pending", "Accepted", "Delivered"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              filter === tab
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ===== Conditional Child ===== */}
      <AnimatePresence mode="wait">
        {isOwner ? (
          <OwnerOrders key="owner" orders={orders} filter={filter} />
        ) : (
          <UserOrders key="user" orders={orders} filter={filter} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
