import { useState } from "react";
import {
  Store,
  MapPin,
  IndianRupee,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Utensils,
} from "lucide-react";

const AvailableOrdersScreen = ({ orders, onAccept, onDecline }) => {
  const [decliningId, setDecliningId] = useState(null);

  const handleDecline = (id) => {
    setDecliningId(id);
    onDecline?.(id);
    setTimeout(() => setDecliningId(null), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between sm:mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            Available Orders
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Swipe through nearby delivery requests
          </p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600 shadow-sm">
          <Package className="h-5 w-5" />
        </span>
      </div>

      {/* Empty state */}
      {!orders || orders.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl bg-white/80 p-10 text-center shadow-card backdrop-blur">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-orange-100 text-orange-500">
            <Utensils className="h-7 w-7" />
          </div>
          <p className="mt-4 font-display text-lg font-bold text-ink">
            No orders nearby
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sit tight — new requests will appear here shortly.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-3xl gap-3 sm:gap-4">
          {orders.map((order) => (
            <div
              key={order.assignmentId}
              className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white p-4 shadow-card transition-all duration-300 hover:shadow-lift sm:p-5"
            >
              {/* Warm accent strip */}
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-orange-500 to-rose-500" />

              <div className="pl-2 sm:pl-3">
                {/* Top row: ID + status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                      #{order.orderId?.slice(-6)}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
                      <Clock className="h-3.5 w-3.5" />
                      {order.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDecline(order.assignmentId)}
                    disabled={decliningId === order.assignmentId}
                    className="shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Decline order"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                {/* Shop + amount */}
                <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 shrink-0 text-orange-500" />
                      <p className="truncate font-display text-base font-bold text-ink sm:text-lg">
                        {order.shopName}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-600">
                      <IndianRupee className="h-4 w-4 shrink-0" />
                      <span>{order.subtotal}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery address */}
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 p-2.5 sm:p-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <p className="min-w-0 text-sm leading-snug text-ink-soft">
                    {order.deliveryAddress?.text}
                  </p>
                </div>

                {/* Accept button */}
                <button
                  onClick={() => onAccept(order.assignmentId)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:opacity-95 active:scale-[0.98] sm:text-base"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  Accept Order
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableOrdersScreen;
