"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import SkeletonTimeline from "@/components/SkeletonTimeline";
// Import icons from a common icon library
import {
  FaBan,
  FaBreadSlice,
  FaAllergies,
  FaStar,
  FaRing,
  FaUtensils,
  FaGift,
  FaTimes,
} from "react-icons/fa";
import { IconType } from "react-icons";
import type { ReservationDetail } from "@/types";
import { getDishCategoryAndColor } from "@/lib/utils";

// Define tag types and their corresponding icons
const requestTagIcons: Record<string, { icon: IconType; label: string }> = {
  "dairy free": { icon: FaBan, label: "Dairy Free" },
  "gluten free": { icon: FaBreadSlice, label: "Gluten Free" },
  "nut free": { icon: FaAllergies, label: "Nut Free" },
  critic: { icon: FaStar, label: "Critic" },
  prop: { icon: FaRing, label: "Special Prop" },
  "adjust dish": { icon: FaUtensils, label: "Adjust Dish" },
  "special request": { icon: FaGift, label: "Special Request" },
};

// Timeline component
export default function Special() {
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationDetail | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch kitchen notes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/timeline-data");

        if (!response.ok) {
          throw new Error("Failed to fetch reservation details");
        }

        const data = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {error || "Failed to load special requests"}
        </div>
      </div>
    );
  }

  // Group requests by time
  const timeGroups = reservations.reduce((groups, request) => {
    if (!groups[request.time]) {
      groups[request.time] = [];
    }
    groups[request.time].push(request);
    return groups;
  }, {} as Record<string, ReservationDetail[]>);

  // Sort reservations by importance within each time group
  const sortedTimeGroups = Object.keys(timeGroups).reduce((sorted, time) => {
    // Sort the reservations for this time slot by status priority
    sorted[time] = timeGroups[time].sort((a, b) => {
      // Define priority values for each status
      const getPriority = (status: string) => {
        switch (status) {
          case "urgent":
            return 1;
          case "attention":
            return 2;
          case "normal":
            return 3;
          default:
            return 4;
        }
      };

      // Sort by priority (lower number = higher priority)
      return getPriority(a.status) - getPriority(b.status);
    });

    return sorted;
  }, {} as Record<string, ReservationDetail[]>);

  // Get unique times in order
  const times = Object.keys(sortedTimeGroups).sort();

  // Helper function to determine if a time should be on the left or right
  const isLeftSide = (time: string) => {
    // Times ending in :00 are on the left, times ending in :30 are on the right
    return time.endsWith(":00");
  };

  // Handle reservation click
  const handleReservationClick = (reservation: ReservationDetail) => {
    // Prevent interaction during animation
    if (isAnimating) return;

    setIsAnimating(true);
    setSelectedReservation(reservation);
    // Start animations
    setIsOverlayVisible(true);
    setTimeout(() => {
      setIsPanelVisible(true);
      // Animation is complete, allow interactions again
      setTimeout(() => setIsAnimating(false), 300);
    }, 50);
  };

  // Close side panel
  const closeSidePanel = () => {
    // Prevent interaction during animation
    if (isAnimating) return;

    setIsAnimating(true);
    // Reverse animation order
    setIsPanelVisible(false);
    setTimeout(() => {
      setIsOverlayVisible(false);
      setTimeout(() => {
        setSelectedReservation(null);
        setIsAnimating(false); // Animation is complete, allow interactions again
      }, 300);
    }, 100);
  };

  return (
    <div className="pt-28 pb-8 px-8 relative overflow-hidden scrollbar-hide">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-8">Timeline</h1>

        {loading ? (
          <SkeletonTimeline />
        ) : (
          <div className="relative w-full max-w-4xl">
            {/* Timeline line - only dotted with gradient fade */}
            <div className="absolute left-1/2 top-0 bottom-0 border-dashed border-l border-gray-700/80 transform -translate-x-1/2 h-full"></div>

            {/* Timeline content */}
            <div className="relative">
              {times.map((time) => (
                <div key={time} className="mb-10 relative">
                  {/* Time marker - now above circle and centered */}
                  <div className="absolute top-[-25px] left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-500/80">
                    {time}
                  </div>

                  {/* Timeline dot - darker color */}
                  <div className="absolute left-1/2 top-2 w-3 h-3 bg-gray-400 rounded-full transform -translate-x-1/2 z-10"></div>

                  {/* Request cards */}
                  <div className="py-6">
                    {sortedTimeGroups[time].map((request) => (
                      <div
                        key={request.id}
                        className={`mb-4 flex ${
                          isLeftSide(time)
                            ? "justify-start pr-[52%]"
                            : "justify-end pl-[52%]"
                        }`}
                      >
                        <Card
                          className={`w-full p-4 bg-opacity-20 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:bg-opacity-30 ${
                            request.status === "urgent"
                              ? "bg-red-950/30 border-red-700/40"
                              : request.status === "attention"
                              ? "bg-amber-950/30 border-amber-700/40"
                              : "bg-green-950/30 border-green-700/40"
                          } ${isAnimating ? "pointer-events-none" : ""}`}
                          onClick={() => handleReservationClick(request)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span
                                className={`text-3xl font-semibold font-sans mr-3 ${
                                  request.status === "urgent"
                                    ? "text-red-400"
                                    : request.status === "attention"
                                    ? "text-amber-400"
                                    : "text-green-400"
                                }`}
                              >
                                {request.people}
                              </span>
                              <span className="text-3xl font-medium text-gray-300/90">
                                {request.name || ""}
                              </span>
                            </div>

                            {/* Tags as icons only, inline with name */}
                            {request.tags && request.tags.length > 0 && (
                              <div className="flex gap-2">
                                {request.tags.map((tag, index) => {
                                  const TagIcon = requestTagIcons[tag]?.icon;
                                  return TagIcon ? (
                                    <div
                                      key={index}
                                      className="rounded-full p-1.5 bg-black/50 border border-gray-800"
                                      title={requestTagIcons[tag]?.label}
                                    >
                                      <TagIcon
                                        className={`${
                                          request.status === "urgent"
                                            ? "text-red-400"
                                            : request.status === "attention"
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {selectedReservation && (
        <div
          className={`fixed inset-y-0 right-0 w-96 bg-gray-950/95 border-l border-gray-800 shadow-xl z-50 overflow-y-auto transform transition-all duration-300 ease-in-out scrollbar-hide ${
            isPanelVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div className="p-8">
            {/* More subtle close button - now darker */}
            <button
              onClick={closeSidePanel}
              className="absolute top-6 right-6 text-gray-800 hover:text-gray-600 transition-colors duration-200"
            >
              <FaTimes size={18} />
            </button>

            {/* Condensed Header */}
            <div className="mb-10 flex items-center">
              {/* Large party size number - fixed green for normal status */}
              <div
                className={`text-5xl font-bold mr-6 ${
                  selectedReservation.status === "urgent"
                    ? "text-red-300"
                    : selectedReservation.status === "attention"
                    ? "text-amber-300"
                    : "text-green-300"
                }`}
              >
                {selectedReservation.people}
              </div>

              <div>
                {/* Name with status color - fixed green for normal status */}
                <h2
                  className={`text-3xl font-bold mb-2 ${
                    selectedReservation.status === "urgent"
                      ? "text-red-300"
                      : selectedReservation.status === "attention"
                      ? "text-amber-300"
                      : "text-green-300"
                  }`}
                >
                  {selectedReservation.name}
                </h2>

                {/* Time and date - now bolder */}
                <div className="flex items-center text-gray-400 font-semibold text-base">
                  <span>{selectedReservation.time}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date().toISOString().split("T")[0]}</span>
                </div>
              </div>
            </div>

            {/* Menu Items with special styling for Chef's Tasting Menu */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-400 mb-4">
                Menu Items
              </h3>
              <div className="space-y-3">
                {selectedReservation.dishes.map((dish, index) => {
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
                {selectedReservation.notes.map((note, index) => (
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
                      <div className="text-sm text-gray-400 mr-2">
                        {note.dish}
                      </div>

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
          </div>
        </div>
      )}

      {/* Overlay with fade effect */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${
          isOverlayVisible ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidePanel}
      ></div>
    </div>
  );
}
