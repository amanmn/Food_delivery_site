import { LogOut, History, ChevronLeft, MapPin } from "lucide-react";

const DeliveryHeader = ({ deliveryBoy, onLogout, onToggleHistory, showingHistory }) => {
  const initials = deliveryBoy?.name
    ? deliveryBoy.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DB";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-orange-100 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Left: Avatar + Info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#ff6b35] to-[#f7931e] text-sm font-bold text-white shadow-md sm:h-12 sm:w-12 sm:text-base">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-bold text-slate-900 sm:text-lg">
              {deliveryBoy?.name || "Delivery Partner"}
            </h2>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 sm:text-sm">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Online
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleHistory}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95 sm:px-4 sm:py-2.5"
          >
            {showingHistory ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </>
            ) : (
              <>
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </>
            )}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#f7931e] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:brightness-105 active:scale-95 sm:px-4 sm:py-2.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DeliveryHeader;
