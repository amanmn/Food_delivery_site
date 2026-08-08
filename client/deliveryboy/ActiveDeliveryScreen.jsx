import { useState } from "react";
import {
  MapPin,
  Phone,
  User,
  Navigation,
  PackageCheck,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import DeliveryBoyTracking from "./DeliveryBoyTracking";

const ActiveDeliveryScreen = ({
  order,
  deliveryBoy,
  onSendOtp,
  onVerifyOtp,
  otp,
  setOtp,
  otpBox,
}) => {
  const [verifying, setVerifying] = useState(false);

  const orderId = order.assignmentId?.slice(-6) || "—";
  const canNavigate =
    order.deliveryAddress?.latitude && order.deliveryAddress?.longitude;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-3xl flex-col gap-4 p-3 sm:p-4 md:p-5">
      {/* MAP */}
      <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-card">
        <div className="h-[45vh] min-h-[260px] w-full sm:h-[50vh]">
          <DeliveryBoyTracking data={order} deliveryBoy={deliveryBoy} />
        </div>
      </section>

      {/* ORDER DETAILS */}
      <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-card sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Order
            </p>
            <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
              Order #{orderId}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            Out for delivery
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b35]" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400">Deliver to</p>
              <p className="text-sm font-medium text-slate-800 sm:text-base">
                {order.deliveryAddress?.text || "No address provided"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <User className="h-5 w-5 shrink-0 text-[#f7931e]" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400">Customer</p>
                <p className="truncate text-sm font-medium text-slate-800">
                  {order.user?.name || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <Phone className="h-5 w-5 shrink-0 text-emerald-500" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400">Phone</p>
                <p className="truncate text-sm font-medium text-slate-800">
                  {order.user?.phone || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {canNavigate && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:brightness-105 active:scale-95"
            >
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Directions</span>
              <span className="sm:hidden">Navigate</span>
            </a>
          )}

          {order.user?.phone && (
            <a
              href={`tel:${order.user.phone}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-105 active:scale-95"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call Customer</span>
              <span className="sm:hidden">Call</span>
            </a>
          )}
        </div>
      </section>

      {/* DELIVERY ACTION */}
      <section className="mt-auto rounded-2xl border border-orange-100 bg-white p-4 shadow-card sm:p-5">
        {otpBox !== order.assignmentId ? (
          <button
            onClick={() => onSendOtp(order)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#f7931e] px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105 active:scale-95"
          >
            <PackageCheck className="h-5 w-5" />
            Mark as Delivered
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-[#ff6b35]" />
              Enter the OTP shared by the customer to complete delivery.
            </div>

            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 4-digit OTP"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] text-slate-900 outline-none transition focus:border-[#ff6b35] focus:bg-white focus:ring-4 focus:ring-orange-100"
            />

            <button
              disabled={verifying}
              onClick={async () => {
                try {
                  setVerifying(true);
                  const success = await onVerifyOtp(order);
                  if (success) {
                    alert("✅ Delivery confirmed!");
                  } else {
                    alert("❌ Invalid OTP");
                  }
                } catch (err) {
                  alert("❌ Something went wrong");
                } finally {
                  setVerifying(false);
                }
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-base font-bold text-white transition active:scale-95 ${
                verifying
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 hover:brightness-105"
              }`}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Confirm Delivery
                </>
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ActiveDeliveryScreen;
