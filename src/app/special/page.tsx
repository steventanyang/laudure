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

  // Fetch kitchen notes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/kitchen-notes");

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
    setSelectedReservation(reservation);
    // Start animations
    setIsOverlayVisible(true);
    setTimeout(() => setIsPanelVisible(true), 50); // Slight delay for overlay to start first
  };

  // Close side panel
  const closeSidePanel = () => {
    // Reverse animation order
    setIsPanelVisible(false);
    setTimeout(() => {
      setIsOverlayVisible(false);
      setTimeout(() => setSelectedReservation(null), 300); // Wait for animations to complete
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
                          }`}
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
            {/* Close button */}
            <button
              onClick={closeSidePanel}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FaTimes size={20} />
            </button>

            {/* Header */}
            <div className="mb-10">
              <div
                className={`inline-block px-3 py-1 rounded-md text-sm font-medium mb-3 ${
                  selectedReservation.status === "urgent"
                    ? "bg-red-950 text-red-300"
                    : selectedReservation.status === "attention"
                    ? "bg-amber-950 text-amber-300"
                    : "bg-green-950 text-green-300"
                }`}
              >
                {selectedReservation.status === "urgent"
                  ? "IMMEDIATE ACTION"
                  : selectedReservation.status === "attention"
                  ? "SPECIAL CARE"
                  : "STANDARD PREP"}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedReservation.name}
              </h2>
              <div className="flex items-center text-gray-400">
                <span className="mr-4">
                  Party of {selectedReservation.people}
                </span>
                <span>{selectedReservation.time}</span>
                <span className="mx-2">•</span>
                <span>{selectedReservation.date}</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Menu Items
              </h3>
              <div className="space-y-3">
                {selectedReservation.dishes.map((dish, index) => {
                  const { color } = getDishCategoryAndColor(dish);
                  return (
                    <div
                      key={index}
                      className="rounded-md p-4 text-white"
                      style={{
                        backgroundColor: `${color}40` /* 25% opacity */,
                      }}
                    >
                      {dish}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
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
                    <div className="text-sm text-gray-400 mb-2">
                      {note.dish}
                    </div>
                    <div className="text-white">{note.note}</div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {note.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-block px-2 py-1 bg-gray-700/70 rounded-md text-xs text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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
