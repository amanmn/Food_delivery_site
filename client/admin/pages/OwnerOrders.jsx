import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  useGetOrderItemsQuery,
  useUpdateOrderStatusMutation,
} from "../../src/redux/features/order/orderApi";
import { useGetDeliveryBoysQuery } from "../../src/redux/features/user/userApi";
import DeliveryBoyList from "../../deliveryboy/DeliveryBoyList";

const OwnerOrders = ({ orders = [], filter }) => {
  const { user } = useSelector((state) => state.user);
  const ownerId = user?._id;

  const [localOrders, setLocalOrders] = useState([]);
  const [updating, setUpdating] = useState(null);

  if (!Array.isArray(orders)) return null;

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useGetOrderItemsQuery(undefined, { skip: !user?._id });

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

  const filteredOrders =
    filter === "All"
      ? ownerOrders
      : ownerOrders.filter((order) =>
        order.shopOrders.some(
          (so) =>
            so.status?.toLowerCase() === filter.toLowerCase()
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
        <p>No {filter.toLowerCase()} shop orders found</p>
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
          transition={{ duration: 0.3 }}
          className="bg-white border rounded-3xl shadow-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b bg-green-50">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">
                  Order ID:{" "}
                  <span className="text-gray-500">
                    {order._id.slice(-8).toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100">
                {order.shopOrders[0].status.replace(/_/g, " ")}
              </span>
            </div>

            {/* User Info */}
            <div className="mt-3 text-xs space-y-1 text-gray-700">
              <p>👤 {order.user?.name}</p>
              <p>✉️ {order.user?.email}</p>
              <p>📞 {order.user?.phone}</p>
              <p>🏠 {order.deliveryAddress?.text}</p>
            </div>
          </div>

          {/* Shop Orders */}
          <div className="p-5 flex-1 space-y-6">
            {order.shopOrders.map((shopOrder) => (
              <div key={shopOrder._id} className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold">
                    🏪 {shopOrder.shop?.name}
                  </h4>
                  <span className="text-sm text-gray-500">
                    ₹{shopOrder.subtotal}
                  </span>
                </div>

                {/* Items */}
                {shopOrder.shopOrderItems?.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between bg-gray-50 rounded-xl p-2 mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item?.item?.image}
                        alt={item?.item?.name}
                        className="w-12 h-12 rounded-lg border"
                      />
                      <div>
                        <p className="font-medium">{item.item.name}</p>
                        <p className="text-xs text-gray-500">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}

                {/* Status */}
                <div className="mt-3 flex justify-between">
                  <label className="text-sm">Status:</label>
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
                    className="border rounded-lg px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">
                      Out for Delivery
                    </option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* 🚚 Assigned Boy OR Available Boys */}
                {shopOrder.assignedDeliveryBoy ? (
                  <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded-xl">
                    <p className="text-sm font-semibold text-green-700">
                      Assigned Delivery Boy
                    </p>
                    <p className="text-sm">
                      👤 {shopOrder.assignedDeliveryBoy.name}
                    </p>
                    <p className="text-sm">
                      📞 {shopOrder.assignedDeliveryBoy.phone}
                    </p>
                  </div>
                ) : (
                  shopOrder.status === "out_for_delivery" &&
                  shopOrder.availableBoys && (
                    <DeliveryBoyList
                      boys={
                        allDeliveryBoys.filter((db) =>
                          shopOrder.availableBoys
                            .map((b) => String(b.id || b._id || b))
                            .includes(String(db.id))
                        )
                      }
                    />
                  )
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t p-5 bg-gray-50 flex justify-between">
            <p>
              Payment:{" "}
              <span className="font-semibold">
                {order.paymentStatus}
              </span>
            </p>
            <p className="font-bold text-green-700">
              ₹{order.shopOrders.reduce(
                (sum, so) => sum + (so.subtotal || 0),
                0
              )}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OwnerOrders;
