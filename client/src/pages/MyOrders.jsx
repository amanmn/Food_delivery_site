import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useGetOrderItemsQuery } from "../redux/features/order/orderApi";
import { setMyOrders } from "../redux/features/order/orderSlice";
import UserOrders from "./UserOrders";
import OwnerOrders from "../../admin/pages/OwnerOrders";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Receipt, Loader2, AlertTriangle } from "lucide-react";

const FILTERS = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "On the way" },
  { key: "Delivered", label: "Delivered" },
];

const MyOrders = () => {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myOrders } = useSelector((state) => state.order);

  const { data: ordersData, isLoading, isError } = useGetOrderItemsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (ordersData?.orders) {
      dispatch(setMyOrders(ordersData.orders));
    }
  }, [ordersData, dispatch]);

  const orders = myOrders || [];
  const isOwner = user?.role === "owner";

  if (isLoading)
    return (
      <div className="relative flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-pink-50 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="relative flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
          <p className="text-gray-600 font-medium">Fetching your orders...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-orange-50 to-pink-50 px-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/80 backdrop-blur-md p-8 shadow-xl ring-1 ring-red-100">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="text-red-500 font-semibold">Something went wrong</p>
          <p className="text-sm text-gray-500">Please refresh and try again.</p>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-8 sm:py-12 px-4 sm:px-8 lg:px-16 overflow-hidden">
      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-pink-300/25 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 min-w-0">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30">
              {isOwner ? <Package className="h-7 w-7" /> : <Receipt className="h-7 w-7" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                {isOwner ? "Shop dashboard" : "Order history"}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 truncate">
                {isOwner ? "Shop Orders" : "Your Orders"}
              </h2>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 self-start sm:self-auto rounded-full bg-white/80 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-gray-800 ring-1 ring-orange-200 shadow-sm hover:shadow-md hover:bg-white transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>

        {/* Filter chips */}
        <div className="relative -mx-4 sm:mx-0 mb-8">
          <div className="flex sm:flex-wrap gap-2.5 overflow-x-auto no-scrollbar px-4 sm:px-0 pb-1">
            {FILTERS.map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
                      : "bg-white/80 backdrop-blur-md text-gray-700 ring-1 ring-orange-100 hover:ring-orange-200 hover:bg-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl bg-white/70 backdrop-blur-md ring-1 ring-orange-100 shadow-xl shadow-orange-500/5 p-4 sm:p-6"
        >
          <AnimatePresence mode="wait">
            {isOwner ? (
              <OwnerOrders key="owner" orders={orders} filter={filter} />
            ) : (
              <UserOrders key="user" orders={orders} filter={filter} />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrders;
