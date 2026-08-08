import React, { useEffect } from "react";
import { Phone, MapPin, Navigation2, User } from "lucide-react";

const DeliveryBoyCard = ({ boy }) => {
  useEffect(() => {
    console.log("DeliveryBoyCard", boy);
  }, [boy]);

  const initials = boy?.name
    ? boy.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DB";

  return (
    <li className="group overflow-hidden rounded-2xl border border-orange-100 bg-white p-4 shadow-card transition-all duration-300 hover:shadow-lift">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500 font-display text-sm font-bold text-white shadow-md sm:h-14 sm:w-14 sm:text-base">
            {initials}
          </div>
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-display text-base font-bold text-ink sm:text-lg">
              {boy?.name}
            </h3>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Active
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            <a
              href={`tel:${boy?.phone}`}
              className="flex items-center gap-2 text-sm font-medium text-ink-soft transition hover:text-orange-500"
            >
              <Phone className="h-4 w-4 shrink-0 text-orange-500" />
              <span className="truncate">{boy?.phone}</span>
            </a>

            <div className="flex items-start gap-2 text-sm text-ink-soft">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <span className="min-w-0 leading-snug">
                {boy?.latitude}, {boy?.longitude}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-4 flex items-center gap-2 border-t border-orange-50 pt-3">
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/maps?q=${boy?.latitude},${boy?.longitude}`,
              "_blank"
            )
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100 sm:text-sm"
        >
          <Navigation2 className="h-3.5 w-3.5" />
          Track Live
        </button>
        <a
          href={`tel:${boy?.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:opacity-95 sm:text-sm"
        >
          <Phone className="h-3.5 w-3.5" />
          Call Now
        </a>
      </div>
    </li>
  );
};

export default DeliveryBoyCard;
