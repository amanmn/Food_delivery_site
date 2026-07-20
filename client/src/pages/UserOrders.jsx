import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateRealTimeOrderStatus } from "../redux/features/order/orderSlice";
import useSocketEvent from "../hooks/useSocketEvent";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  preparing: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
  out_for_delivery: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
  delivered: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

const UserOrders = ({ orders = [], filter }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useSocketEvent("orderStatusUpdated", (data) => {
    dispatch(
      updateRealTimeOrderStatus({
        orderId: data.orderId,
        shopOrderId: data.shopOrderId,
        status: data.status,
      })
    );
  });

  if (!Array.isArray(orders)) return null;

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
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-4xl mb-4 shadow-inner">
          🛍️
        </div>
        <p className="text-lg sm:text-xl font-semibold text-gray-800">
          No {filter} orders found
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Your delicious journey awaits — place your first order!
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
      {filteredOrders.map((order) => {
        const mainStatus =
          order.shopOrders?.[order.shopOrders.length - 1]?.status || "pending";
        const statusClass =
          statusStyles[mainStatus?.toLowerCase()] ||
          "bg-gray-100 text-gray-700 ring-1 ring-gray-200";

        return (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="group relative bg-white/90 backdrop-blur-xl border border-orange-100/70 rounded-3xl shadow-[0_8px_30px_-12px_rgba(255,107,53,0.15)] hover:shadow-[0_20px_45px_-15px_rgba(255,107,53,0.35)] transition-all duration-300 overflow-hidden flex flex-col min-w-0"
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br from-orange-400/20 to-pink-500/20 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity" />

            {/* Header */}
            <div className="relative p-4 sm:p-5 border-b border-orange-100/70 flex justify-between items-start gap-3 bg-gradient-to-r from-orange-50 via-amber-50/60 to-transparent">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-orange-500">
                  Order
                </p>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate font-display">
                  #{order._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <span
                className={`shrink-0 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusClass}`}
              >
                {mainStatus
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </div>

            {/* Items */}
            <div className="p-4 sm:p-5 flex-1 min-w-0">
              {order.shopOrders?.map((shopOrder) => (
                <div key={shopOrder._id} className="mb-5 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm shadow-sm">
                      🏪
                    </span>
                    <h4 className="font-semibold text-gray-800 text-sm truncate">
                      {shopOrder.shop?.name || "Shop"}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {shopOrder.shopOrderItems?.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center gap-3 bg-gradient-to-r from-orange-50/60 to-transparent hover:from-orange-100/60 rounded-2xl p-2 transition-all min-w-0"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={
                              item?.image ||
                              item?.item?.image ||
                              "https://via.placeholder.com/50?text=Food"
                            }
                            alt={item?.name || item?.item?.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-orange-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {item?.name || item?.item?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{item?.price} × {item?.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 text-sm shrink-0">
                          ₹{item?.price * item?.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-orange-100/70 px-4 sm:px-5 py-4 flex flex-col xs:flex-row sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-orange-50/40 to-pink-50/30">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  Payment ·{" "}
                  <span
                    className={`font-semibold ${
                      order.paymentStatus === "pending"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {order.paymentStatus
                      ? order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)
                      : "Unknown"}
                  </span>
                </p>
                <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent font-display">
                  ₹{order.totalAmount}
                </p>
              </div>

              <button
                onClick={() => navigate(`/track-order/${order._id}`)}
                className="shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.03] active:scale-95 transition-all duration-200"
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
