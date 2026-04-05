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
import { FaBackspace } from "react-icons/fa";
import { FaBackwardFast, FaBackwardStep } from "react-icons/fa6";

const OwnerOrders = ({ orders = [], filter }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const ownerId = user?._id;

  const [localOrders, setLocalOrders] = useState([]);
  const [updating, setUpdating] = useState(null);

  if (!Array.isArray(orders)) return null;

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useGetOrderItemsQuery(undefined, {
    skip: !ownerId,
  });
  console.log("Orders Data from API:", ordersData);

  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const { data: allDeliveryBoys = [] } = useGetDeliveryBoysQuery();

  // Load orders from API
  useEffect(() => {
    if (ordersData?.orders) {
      setLocalOrders(ordersData.orders);
    }
    console.log("Orders Data:", ordersData);
  }, [ordersData]);

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?._id) refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?._id, refetch]);

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
        setLocalOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                ...order,
                shopOrders: order.shopOrders.map((so) =>
                  so._id === shopOrderId
                    ? {
                      ...so,
                      ...res.shopOrder,
                      availableBoys:
                        res.shopOrder?.availableBoys ??
                        so.availableBoys ??
                        [],
                      assignedDeliveryBoy:
                        res.shopOrder?.assignedDeliveryBoy,
                      assignment: res.shopOrder?.assignment,
                    }
                    : so
                ),
              }
              : order
          )
        );
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-4">

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate("/dash")}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-blue-500 border rounded-lg shadow-sm hover:bg-gray-100 transition"
          >
            <FaBackwardStep />
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Orders Management
          </h1>

        </div>

        <span className="text-sm text-gray-500">
          Total Orders: {filteredOrders.length}
        </span>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">

        <table className="w-full text-sm">

          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700">
            <tr className="text-left">

              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Delivery</th>

            </tr>
          </thead>


          {/* BODY */}
          <tbody>

            {filteredOrders.map((order) => {

              const shopOrder = order.shopOrders[0]

              return (
                <tr
                  key={order._id}
                  className="border-t hover:bg-gray-50 transition"
                >

                  {/* ORDER */}
                  <td className="p-4">
                    <p className="font-semibold">
                      #{order._id.slice(-6)}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </td>


                  {/* CUSTOMER */}
                  <td className="p-4">

                    <p className="font-medium">
                      {order.user?.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {order.user?.phone}
                    </p>

                  </td>


                  {/* ITEMS */}
                  <td className="p-4">

                    <div className="space-y-1">

                      {shopOrder.shopOrderItems
                        ?.slice(0, 2)
                        .map((item) => (

                          <div
                            key={item._id}
                            className="flex items-center gap-2"
                          >

                            <img
                              src={item.item.image}
                              className="w-8 h-8 rounded object-cover"
                            />

                            <span className="text-xs">
                              {item.item.name} × {item.quantity}
                            </span>

                          </div>
                        ))}

                      {shopOrder.shopOrderItems.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{shopOrder.shopOrderItems.length - 2} more
                        </span>
                      )}

                    </div>

                  </td>


                  {/* AMOUNT */}
                  <td className="p-4 font-semibold text-green-600">
                    ₹{shopOrder.subtotal}
                  </td>


                  {/* PAYMENT */}
                  <td className="p-4">

                    <div className="flex flex-col">

                      <span className="text-xs text-gray-500">
                        {order.paymentMethod}
                      </span>

                      <span
                        className={`text-xs font-semibold ${order.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-red-500"
                          }`}
                      >
                        {order.paymentStatus}
                      </span>

                    </div>

                  </td>


                  {/* STATUS */}
                  <td className="p-4">

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
                      className="border rounded-md px-2 py-1 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">
                        Out for Delivery
                      </option>
                      <option value="delivered">Delivered</option>
                    </select>

                  </td>


                  {/* DELIVERY BOY */}
                  <td className="p-4">

                    {shopOrder.assignedDeliveryBoy ? (

                      <div className="text-xs">

                        <p className="font-medium">
                          {shopOrder.assignedDeliveryBoy.name}
                        </p>

                        <p className="text-gray-500">
                          {shopOrder.assignedDeliveryBoy.phone}
                        </p>

                      </div>

                    ) : (
                      <span className="text-gray-400 text-xs">
                        Not Assigned
                      </span>
                    )}

                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>
    </div>
  )
};

export default OwnerOrders;
