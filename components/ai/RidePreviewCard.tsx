import React from "react";
import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

export interface RidePreviewProps {
  rideId: string;
  title: string;
  startLocation: string;
  endLocation?: string;
  scheduledAt: string;
}

export const RidePreviewCard: React.FC<RidePreviewProps> = ({
  rideId,
  title,
  startLocation,
  endLocation,
  scheduledAt,
}) => {
  const formattedDate = new Date(scheduledAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="my-2 rounded-xl border border-[#3a3a3c] bg-[#1c1c1e] p-3.5 shadow-lg transition-all hover:border-[#ff1d2d]/50">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block rounded-full bg-[#ff1d2d]/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#ff4d57] uppercase">
            Ride Created
          </span>
          <h4 className="mt-1 text-sm font-bold text-white">{title}</h4>
        </div>
      </div>
      <div className="mt-2.5 space-y-1 text-xs text-[#aaaaaa]">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[#ff1d2d]" />
          <span>
            {startLocation} {endLocation ? `➔ ${endLocation}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#8e8e93]" />
          <span>{formattedDate}</span>
        </div>
      </div>
      <div className="mt-3">
        <Link
          href={`/rides/${rideId}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff1d2d] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#b3151f]"
        >
          View Ride <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};
