import { Card } from "@/components/ui/card";
import { ReservationDetail } from "@/types";
import { IconType } from "react-icons";

interface ReservationCardProps {
  reservation: ReservationDetail;
  isLeftSide: boolean;
  isSelected: boolean;
  isAnimating: boolean;
  onClick: () => void;
  requestTagIcons?: Record<string, { icon: IconType; label: string }>;
}

export default function ReservationCard({
  reservation,
  isLeftSide,
  isSelected,
  isAnimating,
  onClick,
  requestTagIcons = {},
}: ReservationCardProps) {
  return (
    <div
      className={`mb-4 flex ${
        isLeftSide ? "justify-start pr-[52%]" : "justify-end pl-[52%]"
      }`}
    >
      <Card
        className={`w-full p-4 bg-opacity-20 backdrop-blur-sm cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-opacity-30 ${
          reservation.status === "urgent"
            ? "bg-red-950/30 border-red-700/40 hover:border-red-600/60"
            : reservation.status === "attention"
            ? "bg-amber-950/30 border-amber-700/40 hover:border-amber-600/60"
            : "bg-green-950/30 border-green-700/40 hover:border-green-600/60"
        } ${isAnimating ? "pointer-events-none" : ""} ${
          isSelected
            ? "scale-105 shadow-xl z-50 border-2 bg-opacity-95 brightness-110"
            : ""
        }`}
        onClick={onClick}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span
              className={`text-3xl font-semibold font-sans mr-3 ${
                reservation.status === "urgent"
                  ? "text-red-400"
                  : reservation.status === "attention"
                  ? "text-amber-400"
                  : "text-green-400"
              }`}
            >
              {reservation.people}
            </span>
            <span className="text-3xl font-medium text-gray-300/90">
              {reservation.name || ""}
            </span>
          </div>

          {/* Tags as icons only, inline with name */}
          {reservation.tags && reservation.tags.length > 0 && (
            <div className="flex gap-2">
              {reservation.tags.map((tag, index) => {
                const TagIcon = requestTagIcons[tag]?.icon;
                return TagIcon ? (
                  <div
                    key={index}
                    className="rounded-full p-1.5 bg-black/50 border border-gray-800"
                    title={requestTagIcons[tag]?.label}
                  >
                    <TagIcon
                      className={`${
                        reservation.status === "urgent"
                          ? "text-red-400"
                          : reservation.status === "attention"
                          ? "text-amber-400"
                          : "text-green-400"
                      }`}
                      size={16}
                    />
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 