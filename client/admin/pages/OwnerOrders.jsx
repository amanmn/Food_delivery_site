import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetOrderItemsQuery,
  useUpdateOrderStatusMutation,
} from "../../src/redux/features/order/orderApi";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  preparing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  out_for_delivery: "bg-purple-50 text-purple-700 ring-purple-600/20",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  canceled: "bg-red-50 text-red-700 ring-red-600/20",
};

const STATUS_LABELS = {
  pending: "Pending",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  canceled: "Canceled",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${
        STATUS_STYLES[status] || "bg-gray-50 text-gray-600 ring-gray-500/20"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function StatusControl({ shopOrder, order, updating, onChange }) {
  const isLocked =
    updating === shopOrder._id ||
    shopOrder.status === "delivered" ||
    shopOrder.status === "canceled" ||
    shopOrder.status === "out_for_delivery";

  if (isLocked) {
    return <StatusBadge status={shopOrder.status} />;
  }

  return (
    <select
      value={shopOrder.status}
      onChange={(e) => onChange(order._id, shopOrder._id, e.target.value)}
      className="border border-gray-200 rounded-md text-xs font-medium pl-2.5 pr-7 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer"
    >
      <option value="pending">Pending</option>
      <option value="preparing">Preparing</option>
      <option value="out_for_delivery">Out for delivery</option>
      <option value="canceled">Cancel order</option>
    </select>
  );
}

function ItemsPreview({ items = [] }) {
  const visible = items.slice(0, 3);
  const extra = items.length - visible.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((item) => (
          <img
            key={item._id}
            src={item?.item?.image}
            alt={item?.item?.name}
            title={`${item?.item?.name} × ${item.quantity}`}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
          />
        ))}
      </div>
      {extra > 0 && (
        <span className="ml-2 text-xs text-gray-400 font-medium">+{extra} more</span>
      )}
    </div>
  );
}

function DeliveryCell({ shopOrder }) {
  if (shopOrder.status === "delivered") {
    return <span className="text-xs font-medium text-emerald-600">Delivered</span>;
  }
  if (shopOrder.status === "canceled") {
    return <span className="text-xs font-medium text-red-500">Canceled</span>;
  }
  if (shopOrder.assignedDeliveryBoy) {
    return (
      <div>
        <p className="text-xs font-medium text-gray-800">
          {shopOrder.assignedDeliveryBoy.name}
        </p>
        <p className="text-xs text-gray-400">{shopOrder.assignedDeliveryBoy.phone}</p>
      </div>
    );
  }
  if (shopOrder.status === "out_for_delivery") {
    return (
      <span className="text-xs text-gray-400">
        {shopOrder.availableBoys?.length > 0
          ? `${shopOrder.availableBoys.length} boys notified`
          : "No delivery boys available"}
      </span>
    );
  }
  return <span className="text-xs text-gray-300">—</span>;
}

const OwnerOrders = ({ filter }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSelector((state) => state.user);

  const [updating, setUpdating] = useState(null);

  const { data: ordersData, isLoading, refetch } = useGetOrderItemsQuery(undefined, {
    skip: !user || user.role !== "owner",
    refetchOnMountOrArgChange: true,
  });

  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  useEffect(() => {
    if (!socket) return;

    const handleRefetch = () => refetch();

    socket.on("newOrder", handleRefetch);
    socket.on("orderStatusUpdated", handleRefetch);

    return () => {
      socket.off("newOrder", handleRefetch);
      socket.off("orderStatusUpdated", handleRefetch);
    };
  }, [socket, refetch]);

  const ownerId = user?._id;

  // Flatten: one row per (order, shopOrder) pair that belongs to this owner
  const rows = (ordersData?.orders || []).flatMap((order) =>
    (order.shopOrders || [])
      .filter((so) => so?.owner === ownerId || so?.owner?._id === ownerId)
      .map((shopOrder) => ({ order, shopOrder }))
  );

  const safeFilter = filter?.toLowerCase() ?? "all";
  const filteredRows =
    safeFilter === "all"
      ? rows
      : rows.filter(({ shopOrder }) => shopOrder.status?.toLowerCase() === safeFilter);

  const handleStatusChange = async (orderId, shopOrderId, newStatus) => {
    setUpdating(shopOrderId);
    try {
      const res = await updateOrderStatus({
        orderId,
        shopOrderId,
        status: newStatus,
      }).unwrap();
      if (res.success) refetch();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 mt-20 text-sm">Loading orders...</div>
    );
  }

  if (filteredRows.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20 text-sm">
        No {(filter ?? "all").toLowerCase()} orders found
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dash")}
            className="text-gray-400 hover:text-gray-700 transition text-sm"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
        </div>
        <span className="text-sm text-gray-400">
          {filteredRows.length} order{filteredRows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ===== Desktop table ===== */}
      <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRows.map(({ order, shopOrder }) => (
              <tr key={shopOrder._id} className="hover:bg-gray-50/60 transition">
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-gray-900">#{order._id.slice(-6)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-gray-800">{order.user?.name}</p>
                  <p className="text-xs text-gray-400">{order.user?.phone}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <ItemsPreview items={shopOrder.shopOrderItems} />
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="text-xs text-gray-500 capitalize">{order.paymentMethod}</p>
                  <span
                    className={`text-xs font-medium ${
                      order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 align-top font-semibold text-gray-900 tabular-nums">
                  ₹{shopOrder.subtotal}
                </td>
                <td className="px-4 py-3 align-top">
                  <StatusControl
                    shopOrder={shopOrder}
                    order={order}
                    updating={updating}
                    onChange={handleStatusChange}
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <DeliveryCell shopOrder={shopOrder} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile cards ===== */}
      <div className="md:hidden space-y-3">
        {filteredRows.map(({ order, shopOrder }) => (
          <div key={shopOrder._id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  #{order._id.slice(-6)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <StatusControl
                shopOrder={shopOrder}
                order={order}
                updating={updating}
                onChange={handleStatusChange}
              />
            </div>

            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{order.user?.name}</p>
                <p className="text-xs text-gray-400">{order.user?.phone}</p>
              </div>
              <p className="font-semibold text-gray-900 tabular-nums">
                ₹{shopOrder.subtotal}
              </p>
            </div>

            <ItemsPreview items={shopOrder.shopOrderItems} />

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span
                className={`text-xs font-medium ${
                  order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {order.paymentMethod} · {order.paymentStatus}
              </span>
              <DeliveryCell shopOrder={shopOrder} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerOrders;