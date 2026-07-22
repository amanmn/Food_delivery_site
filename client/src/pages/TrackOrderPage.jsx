import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetOrderByIdQuery } from '../redux/features/order/orderApi';
import {
  IoIosArrowRoundBack,
} from 'react-icons/io';
import {
  FaStore,
  FaUtensils,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaPhoneAlt,
  FaCheckCircle,
  FaReceipt,
} from 'react-icons/fa';
import DeliveryBoyTracking from '../../deliveryboy/DeliveryBoyTracking';

const TrackOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { data, isLoading, isError } = useGetOrderByIdQuery(orderId);

  useEffect(() => {
    if (data) console.log('Track order data:', data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-orange-200"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😔</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">Failed to load your order details.</p>
          <button
            onClick={() => navigate('/order')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:scale-[1.03] active:scale-95 transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const shopOrder = data?.shopOrders?.[0] || {};
  const deliveryBoy = shopOrder.assignedDeliveryBoy;
  const isDelivered = shopOrder.status === 'delivered';

  // Order progress steps
  const steps = [
    { key: 'pending', label: 'Placed', icon: '📝' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'out_for_delivery', label: 'On the way', icon: '🛵' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];
  const currentStepIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === (shopOrder.status || '').toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 pb-10">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(247,147,30,0.25),transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/order')}
            className="w-11 h-11 rounded-full bg-white/80 backdrop-blur border border-orange-100 shadow-sm flex items-center cursor-pointer justify-center text-orange-500 hover:bg-white hover:scale-105 active:scale-95 transition"
            aria-label="Back"
          >
            <IoIosArrowRoundBack size={30} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-600 via-pink-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Track Order
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              Order #{orderId?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.12)] p-5 sm:p-6 mb-5"
        >
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
              />
            </div>

            {steps.map((step, idx) => {
              const active = idx <= currentStepIndex;
              return (
                <div
                  key={step.key}
                  className="relative z-10 flex flex-col items-center gap-1.5 flex-1"
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base sm:text-lg shadow-md transition-all ${
                      active
                        ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white scale-110'
                        : 'bg-white text-gray-400 ring-1 ring-gray-200'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold text-center leading-tight ${
                      active ? 'text-gray-800' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.12)] overflow-hidden mb-5"
        >
          {/* Shop header */}
          <div className="bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 px-5 sm:px-6 py-4 border-b border-orange-100/60 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <FaStore size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                Restaurant
              </p>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {shopOrder.shop?.name || 'Shop'}
              </h2>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Items */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <FaUtensils size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                  Items
                </p>
                <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                  {shopOrder.shopOrderItems
                    ?.map((it) => it?.item?.name)
                    .filter(Boolean)
                    .join(', ') || '—'}
                </p>
              </div>
            </div>

            {/* Subtotal */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <FaReceipt size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                  Subtotal
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  ₹{shopOrder.subtotal ?? 0}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                <FaMapMarkerAlt size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                  Delivery Address
                </p>
                <p className="text-sm sm:text-base text-gray-800 break-words leading-snug">
                  {data.deliveryAddress?.text || '—'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Boy / Delivered Card */}
        {isDelivered ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-3xl p-6 shadow-[0_20px_40px_-20px_rgba(16,185,129,0.6)] flex items-center gap-4 mb-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <FaCheckCircle size={28} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold">Delivered!</h3>
              <p className="text-sm text-white/90">
                Your order has been delivered successfully. Enjoy your meal! 🎉
              </p>
            </div>
          </motion.div>
        ) : (
          deliveryBoy && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.12)] p-5 sm:p-6 mb-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white shadow">
                  <FaMotorcycle size={14} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Your Delivery Partner
                </h3>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100/70">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
                  {deliveryBoy?.name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                    Delivery Partner
                  </p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                    {deliveryBoy?.name || 'Not Assigned'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {deliveryBoy?.phone || 'N/A'}
                  </p>
                </div>
                {deliveryBoy?.phone && (
                  <a
                    href={`tel:${deliveryBoy.phone}`}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition shrink-0"
                    aria-label="Call delivery partner"
                  >
                    <FaPhoneAlt size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          )
        )}

        {/* Live Tracking Map */}
        {deliveryBoy && !isDelivered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <div className="px-5 sm:px-6 py-4 border-b border-orange-100/60 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Live Tracking
              </h3>
            </div>
            <div className="p-3 sm:p-4">
              <div className="rounded-2xl overflow-hidden ring-1 ring-orange-100">
                <DeliveryBoyTracking
                  data={{
                    deliveryAddress: {
                      latitude: data.deliveryAddress?.latitude,
                      longitude: data.deliveryAddress?.longitude,
                    },
                  }}
                  deliveryBoy={deliveryBoy}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
