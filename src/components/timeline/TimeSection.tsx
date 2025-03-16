/**
 * TimeSection Component
 *
 * This component renders a section of the timeline for a specific time slot.
 * It displays a large time indicator and all reservations for that time.
 *
 * Features:
 * - Alternating left/right layout based on time (00 minutes on left, 30 minutes on right)
 * - Visual highlighting when the time is active
 * - Renders reservation cards for each reservation at this time
 * - Displays guest count and table count summary
 *
 * @param time - The time slot this section represents (e.g., "18:00")
 * @param reservations - Array of reservation details for this time slot
 * @param activeTime - Currently active/highlighted time (if any)
 * @param selectedReservationId - ID of the currently selected reservation (if any)
 * @param isAnimating - Whether animations are currently in progress
 * @param onReservationClick - Callback function when a reservation is clicked
 * @param refCallback - Callback to store a reference to the time display element
 * @param requestTagIcons - Map of tag names to their icon components
 */

import { ReservationDetail } from "@/types";
import ReservationCard from "@/components/timeline/ReservationCard";
import { IconType } from "react-icons";

interface TimeSectionProps {
  time: string;
  reservations: ReservationDetail[];
  activeTime: string | null;
  selectedReservationId: number | null;
  isAnimating: boolean;
  onReservationClick: (reservation: ReservationDetail) => void;
  refCallback: (el: HTMLDivElement | null) => void;
  requestTagIcons: Record<string, { icon: IconType; label: string }>;
}

export default function TimeSection({
  time,
  reservations,
  activeTime,
  selectedReservationId,
  isAnimating,
  onReservationClick,
  refCallback,
  requestTagIcons,
}: TimeSectionProps) {
  // Helper function to determine if a time should be on the left or right
  const isLeftSide = (time: string) => {
    // Times ending in :00 are on the left, times ending in :30 are on the right
    return time.endsWith(":00");
  };

  // Create a combined highlight state to show both activeTime and the section containing the selected reservation
  const isHighlighted = activeTime === time;

  return (
    <div key={time} className="mb-10 relative">
      {/* Timeline dot */}
      <div className="absolute left-1/2 top-2 w-3 h-3 bg-gray-400 rounded-full transform -translate-x-1/2 z-10"></div>

      {/* Request cards */}
      <div className="py-6 relative">
        {/* Large time display in empty space - with active state highlighting */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 ${
            isLeftSide(time) ? "right-8" : "left-8"
          } ${
            isLeftSide(time) ? "text-right" : "text-left"
          } pointer-events-none transition-all duration-500 ${
            isHighlighted ? "z-50" : ""
          }`}
          ref={refCallback}
        >
          <div
            className={`text-7xl font-bold transition-all duration-300 ${
              isHighlighted
                ? "text-white drop-shadow-glow"
                : "text-gray-300 opacity-60"
            }`}
          >
            {time}
          </div>
          <div
            className={`text-xl mt-2 transition-all duration-300 ${
              isHighlighted
                ? "text-white opacity-90 drop-shadow-glow"
                : "text-gray-400 opacity-70"
            }`}
          >
            <span>
              {reservations.reduce((total, req) => total + req.people, 0)}{" "}
              guests • {reservations.length} tables
            </span>
          </div>
        </div>

        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            isLeftSide={isLeftSide(time)}
            isSelected={selectedReservationId === reservation.id}
            isAnimating={isAnimating}
            onClick={() => onReservationClick(reservation)}
            requestTagIcons={requestTagIcons}
          />
        ))}
      </div>
    </div>
  );
}
