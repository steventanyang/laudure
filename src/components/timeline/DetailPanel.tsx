/**
 * DetailPanel Component
 *
 * This component renders a sliding panel that displays detailed information
 * about a selected reservation. It appears when a reservation card is clicked.
 *
 * Features:
 * - Animated slide-in/out transitions
 * - Displays reservation header with guest count and name
 * - Shows all menu items with category-specific styling
 * - Lists special requests with their tags and urgency indicators
 * - Provides navigation between reservations
 * - Status-based color coding (red, amber, green)
 *
 * Special styling:
 * - Chef's Tasting Menu has unique gradient styling
 * - Each dish shows an icon representing its category (appetizer, main, dessert)
 * - Special requests are color-coded by urgency
 *
 * @param reservation - The reservation data to display in detail
 * @param isPanelVisible - Whether the panel should be visible
 * @param onClose - Callback function when the close button is clicked
 * @param onNavigate - Callback function for navigating to previous/next reservation
 * @param hasPrev - Whether there is a previous reservation to navigate to
 * @param hasNext - Whether there is a next reservation to navigate to
 * @param requestTagIcons - Map of tag names to their icon components
 */

import { ReservationDetail } from "@/types";
import { FaTimes, FaChevronLeft } from "react-icons/fa";
import { IconType } from "react-icons";
import { getDishCategoryAndColor } from "@/lib/utils";

interface DetailPanelProps {
  reservation: ReservationDetail;
  isPanelVisible: boolean;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  hasPrev: boolean;
  hasNext: boolean;
  requestTagIcons: Record<string, { icon: IconType; label: string }>;
}

export default function DetailPanel({
  reservation,
  isPanelVisible,
  onClose,
  onNavigate,
  hasPrev,
  hasNext,
  requestTagIcons,
}: DetailPanelProps) {
  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-gray-950/95 border-l border-gray-800 shadow-xl z-50 overflow-y-auto transform transition-all duration-300 ease-in-out scrollbar-hide ${
        isPanelVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div className="p-8">
        {/* Right panel close button - use X icon instead of chevron */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-200 hover:text-white transition-colors duration-200"
        >
          <FaTimes size={16} />
        </button>

        {/* Condensed Header */}
        <div className="mb-10 flex items-center">
          {/* Large party size number - fixed green for normal status */}
          <div
            className={`text-5xl font-bold mr-6 ${
              reservation.status === "urgent"
                ? "text-red-300"
                : reservation.status === "attention"
                ? "text-amber-300"
                : "text-green-300"
            }`}
          >
            {reservation.people}
          </div>

          <div>
            {/* Name with status color - fixed green for normal status */}
            <h2
              className={`text-3xl font-bold mb-2 ${
                reservation.status === "urgent"
                  ? "text-red-300"
                  : reservation.status === "attention"
                  ? "text-amber-300"
                  : "text-green-300"
              }`}
            >
              {reservation.name}
            </h2>

            {/* Time and date - replace date with guest count */}
            <div className="flex items-center text-gray-400 font-semibold text-base">
              <span>{reservation.time}</span>
              <span className="mx-2">•</span>
              <span>{reservation.people} guests</span>
            </div>
          </div>
        </div>

        {/* Menu Items with special styling for Chef's Tasting Menu */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-400 mb-4">
            Menu Items
          </h3>
          <div className="space-y-3">
            {reservation.dishes.map((dish, index) => {
              // Special styling for Chef's Tasting Menu
              if (dish === "Chef's Tasting Menu") {
                return (
                  <div
                    key={index}
                    className="rounded-md p-4 font-bold flex justify-between items-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #8bc34a40, #e0b0b040, #ffca2840, #ce92ce40, #85b1bd40)",
                      color: "#ffffff",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span>{dish}</span>

                    {/* Special icon for Chef's Tasting Menu */}
                    <div className="ml-3 flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path
                          d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z"
                          fill="#ffffff"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>
                  </div>
                );
              }

              // Regular styling for other dishes
              const { category, color } = getDishCategoryAndColor(dish);
              return (
                <div
                  key={index}
                  className="rounded-md p-4 font-bold flex justify-between items-center"
                  style={{
                    backgroundColor: `${color}`,
                    opacity: 0.85,
                    color: "#1a1a1a",
                    textShadow: "0 1px 1px rgba(255,255,255,0.1)",
                  }}
                >
                  <span>{dish}</span>

                  {/* Category shape */}
                  <div className="ml-3 flex-shrink-0">
                    {(category as string) === "appetizers" && (
                      <svg width="24" height="24" viewBox="0 0 40 40">
                        <polygon
                          points="20,5 38,35 2,35"
                          fill="#1a1a1a"
                          stroke="#1a1a1a"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                    {(category as string) === "mains" && (
                      <svg width="24" height="24" viewBox="0 0 30 30">
                        <rect
                          x="3"
                          y="3"
                          width="24"
                          height="24"
                          fill="#1a1a1a"
                          stroke="#1a1a1a"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                    {(category as string) === "desserts" && (
                      <svg width="24" height="24" viewBox="0 0 30 30">
                        <polygon
                          points="15,2 28,11 23,28 7,28 2,11"
                          fill="#1a1a1a"
                          stroke="#1a1a1a"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                    {(category as string) === "other" && (
                      <svg width="24" height="24" viewBox="0 0 30 30">
                        <circle
                          cx="15"
                          cy="15"
                          r="12"
                          fill="#1a1a1a"
                          stroke="#1a1a1a"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Requests with icon-only tags */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-400 mb-4">
            Special Requests
          </h3>
          <div className="space-y-4">
            {reservation.notes.map((note, index) => (
              <div
                key={index}
                className={`bg-gray-800/50 rounded-md p-4 border-l-4 ${
                  note.urgency === "red"
                    ? "border-red-500"
                    : note.urgency === "orange"
                    ? "border-amber-500"
                    : "border-green-500"
                }`}
              >
                {/* Dish name with icons */}
                <div className="flex items-center mb-2">
                  <div className="text-sm text-gray-400 mr-2">{note.dish}</div>

                  {/* Tag icons beside dish name */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.map((tag, tagIndex) => {
                        const TagIcon = requestTagIcons[tag]?.icon;
                        return TagIcon ? (
                          <div
                            key={tagIndex}
                            className={`rounded-full p-1 ${
                              note.urgency === "red"
                                ? "text-red-300"
                                : note.urgency === "orange"
                                ? "text-amber-300"
                                : "text-green-300"
                            }`}
                            title={requestTagIcons[tag]?.label}
                          >
                            <TagIcon size={16} />
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="text-white">{note.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="flex justify-between">
            <button
              onClick={() => onNavigate("prev")}
              disabled={!hasPrev}
              className={`flex items-center px-4 py-2 transition-colors ${
                hasPrev
                  ? "text-gray-300 hover:text-white font-bold"
                  : "text-gray-500 cursor-not-allowed"
              }`}
            >
              <FaChevronLeft className="mr-2" size={14} />
              Prev
            </button>
            <button
              onClick={() => onNavigate("next")}
              disabled={!hasNext}
              className={`flex items-center px-4 py-2 transition-colors ${
                hasNext
                  ? "text-gray-300 hover:text-white font-bold"
                  : "text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
              <FaChevronLeft className="ml-2 transform rotate-180" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
